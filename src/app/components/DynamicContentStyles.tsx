import React from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import { getArchiveUrl, getBookVersionFromUUIDSync } from '../../gateways/createBookConfigLoader';
import { book } from '../content/selectors';
import { fromRelativeUrl, isAbsoluteUrl } from '../content/utils/urlUtils';
import { query } from '../navigation/selectors';
import { assertDefined } from '../utils/assertions';

// tslint:disable-next-line: variable-name
export const WithStyles = styled.div`
  ${(props: { styles: string }) => props.styles}
`;

const cacheStyles = new Map<string, string>();

interface DynamicContentStylesProps extends React.HTMLAttributes<HTMLDivElement> {
  disable?: boolean;
}

// tslint:disable-next-line: variable-name
const DynamicContentStyles = React.forwardRef<HTMLElement, DynamicContentStylesProps>((
  { children, disable, ...otherProps }: React.PropsWithChildren<DynamicContentStylesProps>,
  ref
) => {
  const [styles, setStyles] = React.useState('');
  const queryParams = useSelector(query);
  const currentBook = useSelector(book);

  React.useEffect(() => {
    if (disable) {
      setStyles('');
      return;
    }

    let cssfileUrl = queryParams['content-style'];

    if (!cssfileUrl && currentBook && currentBook.style_href) {
      const bookConfig = getBookVersionFromUUIDSync(currentBook.id);
      if (bookConfig && bookConfig.dynamicStyles) {
        cssfileUrl = currentBook.style_href;

        if (!isAbsoluteUrl(cssfileUrl)) {
          const archiveUrl = `${bookConfig.archiveOverride || getArchiveUrl()}/`;
          cssfileUrl = fromRelativeUrl(archiveUrl, cssfileUrl);
        }
      }
    }

    if (cssfileUrl && typeof cssfileUrl === 'string') {
      if (cacheStyles.has(cssfileUrl)) {
        setStyles(assertDefined(cacheStyles.get(cssfileUrl), `we've just checked for this`));
      } else {
        fetch(cssfileUrl)
          .then((res) => res.text())
          .then((data) => {
            // we are inside an "if" that checks that cssfileUrl is defined and a string
            cacheStyles.set(cssfileUrl as string, data);
            setStyles(data);
          });
      }
    }
  }, [currentBook, disable, queryParams]);

  return <WithStyles styles={styles} data-dynamic-style={!!styles} {...otherProps} ref={ref}>
    {children}
  </WithStyles>;
});

export default DynamicContentStyles;
