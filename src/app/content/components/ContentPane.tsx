import Color from 'color';
import styled, { css } from 'styled-components';
import theme from '../../theme';
import { State } from '../types';
import {
  bookBannerDesktopHeight,
  sidebarDesktopWidth,
  sidebarMobileWidth,
  sidebarTransitionTime,
  toolbarDesktopHeight
} from './constants';
import {
  isOpenConnector,
  styleWhenSidebarClosed
} from './Sidebar';

// tslint:disable-next-line:variable-name
const ContentPane = styled.div<{isOpen: State['tocOpen']}>`
  flex: 1;
  width: 100%;
  overflow: visible;

  transition: margin-left ${sidebarTransitionTime}ms;

  ${styleWhenSidebarClosed(css`
    margin-left: -${sidebarDesktopWidth}rem;
    ${theme.breakpoints.mobile(css`
      margin-left: -${sidebarMobileWidth}rem;
    `)}
  `)}

  ${(props) => props.isOpen && theme.breakpoints.mobile(css`
    :before {
      background-color: ${Color(theme.color.primary.gray.base).alpha(0.75).string()};
      z-index: 2; /* stay above book content */
      position: absolute;
      content: '';
      top: -${toolbarDesktopHeight}rem;
      bottom: 0;
      left: 0;
      right: 0;
    }

    margin-left: -${sidebarMobileWidth}rem;
  `)}

  *:target:before {
    content: " ";
    display: block;
    position: relative;
    margin-top: -${bookBannerDesktopHeight + toolbarDesktopHeight}rem;
    height: ${bookBannerDesktopHeight + toolbarDesktopHeight}rem;
    visibility: hidden;
  }
`;

export default isOpenConnector(ContentPane);
