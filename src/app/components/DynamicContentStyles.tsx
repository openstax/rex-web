import React from 'react';
import { useSelector } from 'react-redux';
import { bookStylesUrl as bookStylesUrlSelector } from '../content/selectors';
import { State } from '../content/types';
import { useServices } from '../context/Services';
import { query } from '../navigation/selectors';
import { AppServices } from '../types';
import { assertDefined } from '../utils/assertions';

const cacheStyles = new Map<string, string>();

const getStyles = (
  disable: boolean | undefined,
  queryStyles: string,
  book: State['book'],
  bookStylesUrl: string | null,
  archiveLoader: AppServices['archiveLoader']
): [boolean, string] => {
  if (!disable) {
    if (queryStyles) {
      // Query param styles have higher priority and override book styles
      return [true, queryStyles];
    } else if (book && bookStylesUrl) {
      // The dynamicStyles hook already checked that the book config had dynamicStyles enabled
      // Returning true with a blank string can happen when hydrating
      // We set data-dynamic-style to true in this case so the HTML remains the same
      return [true, archiveLoader.forBook(book).resource(bookStylesUrl).cached() || ''];
    }
  }

  return [false, ''];
};

interface DynamicContentStylesProps extends React.HTMLAttributes<HTMLDivElement> {
  book: State['book'];
  disable?: boolean;
}

const DynamicContentStyles = React.forwardRef<HTMLElement, DynamicContentStylesProps>((
  { book, children, disable, ...otherProps }: React.PropsWithChildren<DynamicContentStylesProps>,
  ref
) => {
  const [queryStyles, setQueryStyles] = React.useState('');
  const queryParams = useSelector(query);

  // This effect sets the styles for the query param only
  // Book styles use a hook instead, because effects don't work during pre-rendering
  // (and we don't need query styles during pre-rendering)
  React.useEffect(() => {
    if (disable) {
      setQueryStyles('');
      return;
    }

    const cssfileUrl = queryParams?.['content-style'];
    if (cssfileUrl && typeof cssfileUrl === 'string') {
      if (cacheStyles.has(cssfileUrl)) {
        setQueryStyles(assertDefined(cacheStyles.get(cssfileUrl), `we've just checked for this`));
      } else {
        fetch(cssfileUrl)
          .then((res) => res.text())
          .then((data) => {
            cacheStyles.set(cssfileUrl, data);
            setQueryStyles(data);
          });
      }
    }
  }, [disable, queryParams]);

  const { archiveLoader } = useServices();
  const bookStylesUrl = useSelector(bookStylesUrlSelector);
  const [dataDynamicStyle, styles] = getStyles(disable, queryStyles, book, bookStylesUrl, archiveLoader);

  // Inject dynamic styles into a <style> tag
React.useEffect(() => {
  if (!styles || typeof document === 'undefined') {
    return;
  }

  const globalKey = '__rexDynamicContentStyles__';
  const globalStore: any = globalThis; // eslint-disable-line @typescript-eslint/no-explicit-any
  const store = globalKey in globalStore ? globalStore[globalKey] : {
    count: 0,
    element: null as HTMLStyleElement | null,
  };

  store.count += 1;

  if (!store.element || !document.head.contains(store.element)) {
    store.element = document.createElement('style');
    store.element.setAttribute('data-dynamic-content-styles', 'true');
    document.head.appendChild(store.element);
  }

  store.element.textContent = `
    [data-dynamic-style="true"] {
      ${styles}
    }
  `;

  return () => {
    store.count -= 1;
    if (store.count <= 0 && store.element) {
      store.element.remove();
      store.element = null;
    }
  };
}, [styles]);

  return <div data-dynamic-style={dataDynamicStyle} {...otherProps} ref={ref}>
    {children}
  </div>;
});

export default DynamicContentStyles;
