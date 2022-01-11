import React from 'react';
import styled, { css } from 'styled-components/macro';
import theme from '../../theme';
import { sidebarDesktopWithToolbarWidth } from './constants';

// tslint:disable-next-line: variable-name
const Wrapper = styled.div`
  grid-column: 1 / -1;
  grid-row: 1;
  justify-self: center;
  width: 100%;
  overflow: visible; /* so sidebar position: sticky works */
  margin: 0 auto;
  ${theme.breakpoints.desktopSmall(css`
    padding-left: ${sidebarDesktopWithToolbarWidth}rem;
  `)}
  ${theme.breakpoints.mobile(css`
    padding-left: 0;
    grid-column-start: 2;
  `)}
  ${theme.breakpoints.mobileMedium(css`
    grid-column: 1 / -1;
  `)}

  @media screen {
    min-height: 100%;
    display: flex;
    flex-direction: row;
  }
`;

// tslint:disable-next-line: variable-name
const CenteredContentRow: React.FunctionComponent = ({ children }) => {
  return <Wrapper data-testid='centered-content-row'>
    {children}
  </Wrapper>;
};

export default CenteredContentRow;
