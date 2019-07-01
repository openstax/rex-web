import React from 'react';
import { connect } from 'react-redux';
import styled, { css } from 'styled-components/macro';
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
  @media screen {
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

    /*
      common scroll rules for all targets except <table>
      <table>s do not scroll properly no matter what,
      so instead we move their ids to the .os-table <div>s
    */
    *:target:not(table) {
      // allow clicks on elements just above the target
      pointer-events: none !important;
    }

    // scroll rule for inline targets
    *:target:not(div):not(figure):not(table)::before {
      // make the ::before pseudo-element a valid target for scrolling to
      content: " ";

      // inline-block is required to not break paragraphs around inline elements
      display: inline-block;

      // probably not necessary, since the content is just a blank space, but just in case...
      visibility: hidden;

      // the extra 2 rem are required for inline elements to display properly
      margin-top: -${bookBannerDesktopMiniHeight + toolbarDesktopHeight + 2}rem;
      height: ${bookBannerDesktopMiniHeight + toolbarDesktopHeight + 2}rem;
    }

    // scroll rule for targets with display: block but not overflow: auto
    div:target:not(.os-figure):not(.os-table):not(.equation):not([data-type="equation"]) {
      margin-top: -${bookBannerDesktopMiniHeight + toolbarDesktopHeight}rem;
      padding-top: ${bookBannerDesktopMiniHeight + toolbarDesktopHeight}rem;
    }

    // scroll rules for all targets with display: table (except <table>) or overflow: auto
    figure, .equation, [data-type="equation"], .os-table, .os-figure {
      &:target {
        margin-top: -${bookBannerDesktopMiniHeight + toolbarDesktopHeight}rem !important;
      }
    }

    /*
      to avoid changing the layout, the rule above is split into 3 subrules that
      set the target's padding-top to be slightly higher than the above margin-top
      by an amount equal to the normal value of the elements' margin-top + padding-top
      they must be kept in sync if the elements' margin-top or padding-top changes
      all of the elements below already had padding-top: 0 by default
    */

    // margin-top: 0
    figure, .equation, [data-type="equation"] {
      &:target {
        padding-top: ${bookBannerDesktopMiniHeight + toolbarDesktopHeight}rem;
      }
    }

    // margin-top: 1.5rem (normally 20 px, but 20/14rem is too short; 1.5rem is just right)
    .os-table:target {
      padding-top: ${bookBannerDesktopMiniHeight + toolbarDesktopHeight + 1.5}rem;
    }

    // margin-top: 3rem
    .os-figure:target {
      padding-top: ${bookBannerDesktopMiniHeight + toolbarDesktopHeight + 3}rem;
    }
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
