import React from 'react';
import { connect } from 'react-redux';
import styled, { css } from 'styled-components';
import MobileScrollLock from '../../components/MobileScrollLock';
import theme from '../../theme';
import { Dispatch } from '../../types';
import { closeToc } from '../actions';
import { State } from '../types';
import {
  bookBannerDesktopMiniHeight,
  sidebarDesktopWidth,
  sidebarMobileWidth,
  sidebarTransitionTime,
  toolbarDesktopHeight
} from './constants';
import { isOpenConnector, styleWhenSidebarClosed } from './utils/sidebar';

// tslint:disable-next-line:variable-name
const Wrapper = styled.div<{isOpen: State['tocOpen']}>`
  flex: 1;
  width: 100%;
  overflow: visible;
  transition: margin-left ${sidebarTransitionTime}ms;
  ${styleWhenSidebarClosed(css`
    margin-left: -${sidebarDesktopWidth}rem;
  `)}

  ${theme.breakpoints.mobile(css`
    margin-left: -${sidebarMobileWidth}rem;
  `)}

  *:target::before {
    content: " ";
    display: block;
    position: relative;
    margin-top: -${bookBannerDesktopMiniHeight + toolbarDesktopHeight}rem;
    height: ${bookBannerDesktopMiniHeight + toolbarDesktopHeight}rem;
    visibility: hidden;
  }
`;

interface Props {
  isOpen: State['tocOpen'];
  onClick: () => void;
}

// tslint:disable-next-line:variable-name
const ContentPane: React.SFC<Props> = ({isOpen, onClick, children}) => <Wrapper isOpen={isOpen}>
  {isOpen && <MobileScrollLock onClick={onClick} />}
  {children}
</Wrapper>;

const dispatchConnector = connect(
  () => ({}),
  (dispatch: Dispatch) => ({
    onClick: () => dispatch(closeToc()),
  })
);

export default isOpenConnector(dispatchConnector(ContentPane));
