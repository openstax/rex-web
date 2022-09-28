import React from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import { stylesUrl as stylesUrlSelector } from '../content/selectors';
import { State } from '../content/types';
import { useServices } from '../context/Services';

// tslint:disable-next-line: variable-name
export const WithStyles = styled.div`
  ${(props: { styles: string }) => props.styles}
`;

interface DynamicContentStylesProps extends React.HTMLAttributes<HTMLDivElement> {
  book: State['book'];
  disable?: boolean;
}

// tslint:disable-next-line: variable-name
const DynamicContentStyles = React.forwardRef<HTMLElement, DynamicContentStylesProps>((
  { book, children, disable, ...otherProps }: React.PropsWithChildren<DynamicContentStylesProps>,
  ref
) => {
  const { archiveLoader } = useServices();
  const stylesUrl = useSelector(stylesUrlSelector);
  const styles = disable || !book || !stylesUrl ?
    '' : archiveLoader.resource(stylesUrl, book.loadOptions).cached() || '';

  return <WithStyles styles={styles} data-dynamic-style={!!styles} {...otherProps} ref={ref}>
    {children}
  </WithStyles>;
});

export default DynamicContentStyles;
