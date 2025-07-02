import React from 'react';
import { connect } from 'react-redux';
import styled, { css } from 'styled-components/macro';
import ScrollLock from '../../components/ScrollLock';
import theme from '../../theme';
import { Dispatch } from '../../types';
import { remsToEms } from '../../utils';
import { closeToc } from '../actions';
import { State } from '../types';
import {
  contentWrapperMaxWidth,
  mainContentBackground,
  sidebarDesktopWidth,
  sidebarDesktopWithToolbarWidth,
  sidebarTransitionTime,
  verticalNavbarMaxWidth,
} from './constants';
import { isVerticalNavOpenConnector, styleWhenSidebarClosed } from './utils/sidebar';

export const contentWrapperWidthBreakpoint = '(max-width: ' + remsToEms(contentWrapperMaxWidth) + 'em)';
export const contentWrapperAndNavWidthBreakpoint =
  '(max-width: ' + remsToEms(contentWrapperMaxWidth + verticalNavbarMaxWidth * 2) + 'em)';
const contentWrapperBreakpointStyles = `
  @media screen and ${contentWrapperAndNavWidthBreakpoint} {
    padding-left: calc(${sidebarDesktopWithToolbarWidth}rem - (100vw - ${contentWrapperMaxWidth}rem) / 2);
  }

  @media screen and ${contentWrapperWidthBreakpoint} {
    padding-left: ${sidebarDesktopWithToolbarWidth}rem;
  }
`;
// tslint:disable-next-line:variable-name
const Wrapper = styled.div<{verticalNavOpen: State['tocOpen']}>`
  grid-column: 1 / -1;
  grid-row: 1;
  justify-self: center;
  width: 100%;
  overflow: visible; /* so sidebar position: sticky works */
  margin: 0 auto;
  max-width: ${contentWrapperMaxWidth}rem;
  ${theme.breakpoints.mobile(css`
    grid-column-start: 2;
  `)}
  ${theme.breakpoints.mobileMedium(css`
    grid-column: 1 / -1;
  `)}

  @media screen {
    background-color: ${mainContentBackground};
    padding-left: ${sidebarDesktopWidth}rem;
    transition: padding-left ${sidebarTransitionTime}ms ease-in-out;
    ${contentWrapperBreakpointStyles}
    ${theme.breakpoints.mobile(css`
      padding-left: 0;
    `)}

    ${styleWhenSidebarClosed(css`
      padding-left: 0 !important;
    `)}
  }
`;

interface Props {
  isDesktopSearchOpen: boolean;
  isVerticalNavOpen: State['tocOpen'];
  onClick: () => void;
}

// tslint:disable-next-line:variable-name
const ContentPane = ({ isDesktopSearchOpen, isVerticalNavOpen, onClick, children }: React.PropsWithChildren<Props>) =>
  <Wrapper
    isVerticalNavOpen={isVerticalNavOpen}
    isDesktopSearchOpen={isDesktopSearchOpen}
    data-testid='centered-content-row'
  >
      {isVerticalNavOpen &&
        <ScrollLock
          onClick={onClick}
          mediumScreensOnly={true}
          overlay={true}
          zIndex={theme.zIndex.overlay}
      />}
    {children}
  </Wrapper>;

const dispatchConnector = connect(
  () => ({}),
  (dispatch: Dispatch) => ({
    onClick: () => dispatch(closeToc()),
  })
);

export default isVerticalNavOpenConnector(dispatchConnector(ContentPane));
