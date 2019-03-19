import Color from 'color';
import React from 'react';
import { connect } from 'react-redux';
import styled, { css } from 'styled-components';
import MainContent from '../../components/MainContent';
import theme from '../../theme';
import { AppState } from '../../types';
import * as selectors from '../selectors';
import { bookBannerDesktopHeight } from './BookBanner';
import { sidebarTransitionTime, sidebarWidth } from './Sidebar';
import { toolbarDesktopHeight } from './Toolbar';

// tslint:disable-next-line:variable-name
const Hoc: React.SFC<{isOpen: boolean}> = (props) => <MainContent {...props} />;

// tslint:disable-next-line:variable-name
const ContentPane = styled(Hoc)`
  flex: 1;
  overflow: hidden;

  transition: margin-left ${sidebarTransitionTime}ms;

  margin-left: 0px;

  ${(props) => !props.isOpen && css`
    margin-left: -${sidebarWidth}rem;
  `}

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

    margin-left: -${sidebarWidth}rem;
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
