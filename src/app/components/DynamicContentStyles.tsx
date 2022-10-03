import { OutputParams } from 'query-string';
import React from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import { bookStylesUrl as bookStylesUrlSelector } from '../content/selectors';
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

const getStyles = (
  disable: boolean,
  queryStyles: string,
  book: State['book'],
  bookStylesUrl: string,
  archiveLoader: AppServices['archiveLoader']
): string => {
  if (!disable) {
    if (queryStyles) {
      // Query param styles have higher priority and override book styles
      return queryStyles;
    } else if (book && bookStylesUrl) {
      // The dynamicStyles hook already checked that the book config had dynamicStyles enabled
      const cachedStyles = archiveLoader.forBook(book).resource(bookStylesUrl).cached();
      if (cachedStyles) {
        return cachedStyles;
      }
    }
  }

  return '';
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

    const cssfileUrl = queryParams['content-style'];
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
  const styles = getStyles(disable, queryStyles, book, bookStylesUrl, archiveLoader);

  return <WithStyles styles={styles} data-dynamic-style={!!styles} {...otherProps} ref={ref}>
    {children}
  </WithStyles>;
});

export default DynamicContentStyles;
