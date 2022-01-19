import React from 'react';
import { connect } from 'react-redux';
import styled, { css } from 'styled-components/macro';
import ScrollLock from '../../components/ScrollLock';
import theme from '../../theme';
import { Dispatch } from '../../types';
import { closeToc } from '../actions';
import { State } from '../types';
import {
  mainContentBackground,
  sidebarDesktopWidth,
  sidebarTransitionTime,
} from './constants';
import { isVerticalNavOpenConnector } from './utils/sidebar';

// tslint:disable-next-line:variable-name
const Wrapper = styled.div<{isVerticalNavOpen: State['tocOpen']}>`
  @media screen {
    flex: 1;
    width: 100%;
    overflow: visible;
    transition: padding-left ${sidebarTransitionTime}ms;
    background-color: ${mainContentBackground};
    ${(props) => (props.isVerticalNavOpen || props.isVerticalNavOpen ===  null) && `
      padding-left: ${sidebarDesktopWidth}rem;
    `}

    ${theme.breakpoints.mobile(css`
      padding-left: 0;
    `)}
  }
`;

interface Props {
  isVerticalNavOpen?: State['tocOpen'];
  onClick: () => void;
}

// tslint:disable-next-line:variable-name
const ContentPane = ({ isVerticalNavOpen, onClick, children }: React.PropsWithChildren<Props>) =>
  <Wrapper isVerticalNavOpen={isVerticalNavOpen}>
    {isVerticalNavOpen &&
      <ScrollLock
        onClick={onClick}
        mobileOnly={true}
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
