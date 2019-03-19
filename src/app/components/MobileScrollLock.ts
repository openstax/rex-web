import { ReactElement } from 'react';
import styled, { css } from 'styled-components';
import theme from '../theme';

// tslint:disable-next-line:variable-name
const Hoc = ({children, className}: {className?: string, children: (className?: string) => ReactElement<any>}) =>
  children(className);

export default styled(Hoc)`

  ${theme.breakpoints.mobile(css`
    overflow: hidden;
  `)}
`;
