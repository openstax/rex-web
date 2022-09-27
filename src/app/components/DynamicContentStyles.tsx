import { OutputParams } from 'query-string';
import React from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import { stylesUrl as stylesUrlSelector } from '../content/selectors';
import { State } from '../content/types';
import { fromRelativeUrl, isAbsoluteUrl } from '../content/utils/urlUtils';
import { useServices } from '../context/Services';
import { AppServices } from '../types';
import { assertDefined } from '../utils/assertions';

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
  const styles = disable ? '' : archiveLoader.resource(stylesUrl).cached();

  return <WithStyles styles={styles} data-dynamic-style={!!styles} {...otherProps} ref={ref}>
    {children}
  </WithStyles>;
});

export default DynamicContentStyles;
