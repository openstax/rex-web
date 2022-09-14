import { OutputParams } from 'query-string';
import React from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import { State } from '../content/types';
import { fromRelativeUrl, isAbsoluteUrl } from '../content/utils/urlUtils';
import { useServices } from '../context/Services';
import { query } from '../navigation/selectors';
import { AppServices } from '../types';
import { assertDefined } from '../utils/assertions';

// tslint:disable-next-line: variable-name
export const WithStyles = styled.div`
  ${(props: { styles: string }) => props.styles}
`;

const cacheStyles = new Map<string, string>();

const getCssFileUrl = (
  queryParams: OutputParams, book: State['book'], archiveLoader: AppServices['archiveLoader']
) => {
  if (queryParams['content-style']) {
    return queryParams['content-style'];
  } else if (book) {
    const dynamicStylesEnabled = book.loadOptions.booksConfig.books[book.id]?.dynamicStyles;

    if (dynamicStylesEnabled && book.style_href) {
      if (isAbsoluteUrl(book.style_href)) {
        return book.style_href;
      } else {
        const contentUrl = archiveLoader.forBook(book).url();
        return fromRelativeUrl(contentUrl, book.style_href);
      }
    }
  }
};

interface DynamicContentStylesProps extends React.HTMLAttributes<HTMLDivElement> {
  book: State['book'];
  disable?: boolean;
}

// tslint:disable-next-line: variable-name
const DynamicContentStyles = React.forwardRef<HTMLElement, DynamicContentStylesProps>((
  { book, children, disable, ...otherProps }: React.PropsWithChildren<DynamicContentStylesProps>,
  ref
) => {
  const [styles, setStyles] = React.useState('');
  const queryParams = useSelector(query);
  const { archiveLoader } = useServices();

  React.useEffect(() => {
    if (disable) {
      setStyles('');
      return;
    }

    const cssfileUrl = getCssFileUrl(queryParams, book, archiveLoader);
    if (cssfileUrl && typeof cssfileUrl === 'string') {
      if (cacheStyles.has(cssfileUrl)) {
        setStyles(assertDefined(cacheStyles.get(cssfileUrl), `we've just checked for this`));
      } else {
        fetch(cssfileUrl)
          .then((res) => res.text())
          .then((data) => {
            cacheStyles.set(cssfileUrl, data);
            setStyles(data);
          });
      }
    }
  }, [archiveLoader, book, disable, queryParams]);

  return <WithStyles styles={styles} data-dynamic-style={!!styles} {...otherProps} ref={ref}>
    {children}
  </WithStyles>;
});

export default DynamicContentStyles;
