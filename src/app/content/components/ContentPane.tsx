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

/*
 * solution in place for display: table
 * elements resets their top margin, so we
 * need to know the original to add it back in
 */
const displayTableElements = [
  {selector: '#main-content .os-table', margin: 2},
  {selector: '#main-content .os-figure', margin: 3},
  {selector: '#main-content [data-type="equation"]', margin: 0},
];
const inlineBlockElements = [
  {selector: '[data-type="term"]'},
];

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

    ${displayTableElements.map((elementType) => css`
      ${elementType.selector}:target {
        margin-top: -${bookBannerDesktopMiniHeight + toolbarDesktopHeight}rem;

        ::before {
          content: ' ';
          display: table-row;
          height: ${bookBannerDesktopMiniHeight + toolbarDesktopHeight + elementType.margin}rem;
        }
      }
    `)}
    ${inlineBlockElements.map((elementType) => css`
      ${elementType.selector}:target::before {
        content: ' ';
        display: inline-block;
        position: relative;
        margin-top: -${bookBannerDesktopMiniHeight + toolbarDesktopHeight}rem;
        height: ${bookBannerDesktopMiniHeight + toolbarDesktopHeight}rem;
        visibility: hidden;
      }
    `)}
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
