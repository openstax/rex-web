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
  verticalNavbarMaxWidth,
} from './constants';
import { isVerticalNavOpenConnector, styleWhenSidebarClosed } from './utils/sidebar';

export const contentWrapperWidthBreakpoint = '(max-width: ' + remsToEms(contentWrapperMaxWidth) + 'em)';
export const contentWrapperAndNavWidthBreakpoint =
  '(max-width: ' + remsToEms(contentWrapperMaxWidth + verticalNavbarMaxWidth) + 'em)';

// tslint:disable-next-line:variable-name
const Wrapper = styled.div`
  @media screen {
    flex: 1;
    width: 100%;
    overflow: visible;
    background-color: ${mainContentBackground};
    padding-left: ${sidebarDesktopWidth}rem;

    @media screen and ${contentWrapperAndNavWidthBreakpoint} {
      padding-left: calc(${sidebarDesktopWithToolbarWidth}rem - (100vw - ${contentWrapperMaxWidth}rem) / 2);
    }

    @media screen and ${contentWrapperWidthBreakpoint} {
      padding-left: ${sidebarDesktopWithToolbarWidth}rem;
    }

    ${theme.breakpoints.mobile(css`
      padding-left: 0;
    `)}

    ${styleWhenSidebarClosed(css`
      padding-left: 0;
    `)}
  }
`;

interface Props {
  isTocOpen: State['tocOpen'];
  isVerticalNavOpen: State['tocOpen'];
  onClick: () => void;
}

// tslint:disable-next-line:variable-name
const ContentPane = ({ isVerticalNavOpen, onClick, children }: React.PropsWithChildren<Props>) =>
  <Wrapper isVerticalNavOpen={isVerticalNavOpen}>
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
