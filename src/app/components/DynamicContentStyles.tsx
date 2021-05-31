import React from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import { query } from '../navigation/selectors';

// tslint:disable-next-line: variable-name
export const WithStyles = styled.div`
  ${(props: { styles: string }) => props.styles}
`;

// tslint:disable-next-line: variable-name
const DynamicContentStyles = ({ children }: { children: React.ReactNode }) => {
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

  return <WithStyles styles={styles}>
    {children}
  </WithStyles>;
};

export default DynamicContentStyles;
