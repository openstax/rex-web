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
  sidebarDesktopWithToolbarWidth,
} from './constants';
import { areSidebarsOpenConnector } from './utils/sidebar';

// tslint:disable-next-line:variable-name
const Wrapper = styled.div<{isTocOpen: State['tocOpen'], isSearchOpen: boolean}>`
  @media screen {
    flex: 1;
    width: 100%;
    overflow: visible;
    background-color: ${mainContentBackground};
    ${(props) => (props.isTocOpen || props.isTocOpen ===  null || props.isSearchOpen) && `
      padding-left: ${sidebarDesktopWithToolbarWidth}rem;
    `}
    ${theme.breakpoints.mobile(css`
      padding-left: 0;
    `)}
  }
`;

interface Props {
  isTocOpen: State['tocOpen'];
  isSearchOpen: boolean;
  onClick: () => void;
}

// tslint:disable-next-line:variable-name
const ContentPane = ({ isTocOpen, isSearchOpen, onClick, children }: React.PropsWithChildren<Props>) =>
  <Wrapper isTocOpen={isTocOpen} isSearchOpen={isSearchOpen}>
    {isTocOpen &&
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

export default areSidebarsOpenConnector(dispatchConnector(ContentPane));
