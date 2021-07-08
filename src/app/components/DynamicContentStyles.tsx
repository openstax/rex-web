import React from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
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
  const queryParams = useSelector(query);
  const [styles, setStyles] = React.useState('');

  React.useEffect(() => {
    if (disable) {
      setStyles('');
      return;
    }

    const cssfileUrl = queryParams['content-style'];
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
  }, [disable, queryParams]);

  return <WithStyles styles={styles} data-dynamic-style={!!styles} {...otherProps} ref={ref}>
    {children}
  </WithStyles>;
});

export default DynamicContentStyles;
