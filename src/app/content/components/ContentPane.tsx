import React from 'react';
import styled, { css } from 'styled-components';
import MobileScrollLock from '../../components/MobileScrollLock';
import theme from '../../theme';
import { State } from '../types';
import {
  bookBannerDesktopHeight,
  sidebarDesktopWidth,
  sidebarMobileWidth,
  sidebarTransitionTime,
  toolbarDesktopHeight
} from './constants';
import { isOpenConnector, styleWhenSidebarClosed } from './utils/sidebar';

// tslint:disable-next-line:variable-name
const ContentPane = styled.div<{isOpen: State['tocOpen']}>`
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
    margin-top: -${bookBannerDesktopHeight + toolbarDesktopHeight}rem;
    height: ${bookBannerDesktopHeight + toolbarDesktopHeight}rem;
    visibility: hidden;
  }
`;

export default isOpenConnector(({isOpen, children}) => <ContentPane isOpen={isOpen}>
  {isOpen && <MobileScrollLock />}
  {children}
</ContentPane>);
