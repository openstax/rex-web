import Color from 'color';
import { connect } from 'react-redux';
import styled, { css } from 'styled-components';
import theme from '../../theme';
import { AppState } from '../../types';
import * as selectors from '../selectors';
import { State } from '../types';
import { bookBannerDesktopHeight } from './BookBanner';
import { sidebarDesktopWidth, sidebarMobileWidth, sidebarTransitionTime, styleWhenSidebarClosed } from './Sidebar';
import { toolbarDesktopHeight } from './Toolbar';

// tslint:disable-next-line:variable-name
const ContentPane = styled.div<{isOpen: State['tocOpen']}>`
  flex: 1;
  width: 100%;
  overflow: visible;

  transition: margin-left ${sidebarTransitionTime}ms;

  margin-left: ${theme.padding.page.desktop}rem;
  ${theme.breakpoints.mobile(css`
    margin-left: ${theme.padding.page.mobile}rem;
  `)}

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

export default connect(
  (state: AppState) => ({
    isOpen: selectors.tocOpen(state),
  })
)(ContentPane);
