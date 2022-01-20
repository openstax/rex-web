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
import { isVerticalNavOpenConnector, styleWhenTocClosed } from './utils/sidebar';

// tslint:disable-next-line:variable-name
const Wrapper = styled.div`
  @media screen {
    flex: 1;
    width: 100%;
    overflow: visible;
    transition: padding-left ${sidebarTransitionTime}ms;
    background-color: ${mainContentBackground};
    padding-left: ${sidebarDesktopWidth}rem;

    ${styleWhenTocClosed(css`
      padding-left: 0;
    `)}

    ${theme.breakpoints.mobile(css`
      padding-left: 0;
    `)}
  }
`;

interface Props {
  isVerticalNavOpen: State['tocOpen'];
  onClick: () => void;
}

// tslint:disable-next-line:variable-name
const ContentPane = ({ isVerticalNavOpen, onClick, children }: React.PropsWithChildren<Props>) =>
  <Wrapper isVerticalNavOpen={isVerticalNavOpen}>
    {isVerticalNavOpen &&
      <ScrollLock
        onClick={onClick}
        mediumOnly={true}
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
