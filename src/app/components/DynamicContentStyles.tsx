import React from 'react';
import type { HTMLStyleElement } from '@openstax/types/lib.dom';
import { useSelector } from 'react-redux';
import { bookStylesUrl as bookStylesUrlSelector } from '../content/selectors';
import { State } from '../content/types';
import { useServices } from '../context/Services';
import { query } from '../navigation/selectors';
import { AppServices } from '../types';
import { assertDefined } from '../utils/assertions';

const cacheStyles = new Map<string, string>();

/**
 * Wraps CSS content in a nesting selector to scope all styles to elements with a specific attribute.
 * Uses CSS nesting (supported in all modern browsers) to automatically scope all selectors.
 *
 * Example:
 *   Input:  ".cool { color: blue; }"
 *   Output: "[data-dynamic-style=\"true\"] { .cool { color: blue; } }"
 *
 * CSS nesting automatically handles:
 * - Simple selectors: .class, #id, element
 * - Complex selectors: .class1 .class2, .class1, .class2
 * - Functional pseudos: :not(), :is(), :has()
 * - At-rules: @media, @keyframes, @supports
 * - Pseudo-elements and pseudo-classes
 *
 * @internal Exported for testing purposes only
 */
export const wrapWithNesting = (css: string, scope: string): string => {
  return `${scope} {\n${css}\n}`;
};

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
  // Use an isomorphic layout effect to avoid SSR warnings during prerendering,
  // while still injecting synchronously before paint in the browser.
  /* istanbul ignore next */
  const useIsomorphicLayoutEffect =
    typeof window !== 'undefined' ? React.useLayoutEffect : React.useEffect;

  useIsomorphicLayoutEffect(() => {
    if (!styles || typeof document === 'undefined') {
      return;
    }

    const globalKey = '__rexDynamicContentStyles__';
    const globalStore: any = globalThis; // eslint-disable-line @typescript-eslint/no-explicit-any

    if (!(globalKey in globalStore)) {
      globalStore[globalKey] = {
        count: 0,
        element: null as HTMLStyleElement | null,
      };
    }

    const store = globalStore[globalKey];
    store.count += 1;

    if (!store.element || !document.head.contains(store.element)) {
      store.element = document.createElement('style');
      store.element.setAttribute('data-dynamic-content-styles', 'true');
      document.head.appendChild(store.element);
    }

    // Wrap the CSS in a nesting block to scope all styles to [data-dynamic-style="true"]
    // This uses native CSS nesting, which is supported in all modern browsers
    const scopedStyles = wrapWithNesting(styles, '[data-dynamic-style="true"]');
    store.element.textContent = scopedStyles;

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
