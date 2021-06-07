import React from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import { query } from '../navigation/selectors';

// tslint:disable-next-line: variable-name
export const WithStyles = styled.div`
  ${(props: { styles: string }) => props.styles}
`;

interface DynamicContentStylesProps extends React.HTMLAttributes<HTMLDivElement> {}

// tslint:disable-next-line: variable-name
const DynamicContentStyles = ({ children, ...otherProps }: React.PropsWithChildren<DynamicContentStylesProps>) => {
  const queryParams = useSelector(query);
  const [styles, setStyles] = React.useState('');

  React.useEffect(() => {
    const cssfileUrl = queryParams['content-style'] as string | undefined;
    if (cssfileUrl) {
      fetch(cssfileUrl)
        .then((res) => res.text())
        .then((data) => setStyles(data));
    }
  }, [queryParams]);

  return <WithStyles styles={styles} data-dynamic-style={!!styles} {...otherProps}>
    {children}
  </WithStyles>;
};

export default DynamicContentStyles;
