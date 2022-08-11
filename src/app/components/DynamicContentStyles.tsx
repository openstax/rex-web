import React from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import { getBookVersionFromUUIDSync } from '../../gateways/createBookConfigLoader';
import { State } from '../content/types';
import { fromRelativeUrl, isAbsoluteUrl } from '../content/utils/urlUtils';
import { useServices } from '../context/Services';
import { query } from '../navigation/selectors';
import { assertDefined } from '../utils/assertions';

// tslint:disable-next-line: variable-name
export const WithStyles = styled.div`
  ${(props: { styles: string }) => props.styles}
`;

const cacheStyles = new Map<string, string>();

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
  const { archiveLoader } = useServices();
  const bookConfig = book && getBookVersionFromUUIDSync(book.id);
  const queryParams = useSelector(query);

  React.useEffect(() => {
    if (disable) {
      setStyles('');
      return;
    }

    let cssfileUrl = queryParams['content-style'];

    if (!cssfileUrl && bookConfig?.dynamicStyles && book?.style_href) {
      cssfileUrl = book.style_href;

      if (!isAbsoluteUrl(cssfileUrl)) {
        const contentUrl = archiveLoader.book(book.id, book.version).url();
        cssfileUrl = fromRelativeUrl(contentUrl, cssfileUrl);
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
  }, [archiveLoader, book, bookConfig, disable, queryParams]);

  return <WithStyles styles={styles} data-dynamic-style={!!styles} {...otherProps} ref={ref}>
    {children}
  </WithStyles>;
});

export default DynamicContentStyles;
