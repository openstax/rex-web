import React from 'react';
import { connect } from 'react-redux';
import { AppState, Dispatch } from '../../types';
import * as actions from '../actions';
import * as selectors from '../selectors';

interface Props {
  isOpen: boolean;
  openToc: typeof actions['openToc'];
  closeToc: typeof actions['closeToc'];
}

// tslint:disable-next-line:variable-name
const SidebarControl: React.SFC<Props> = ({isOpen, closeToc, openToc}) => <button
  onClick={() => isOpen ? closeToc() : openToc()}
>toc</button>;

export default connect(
  (state: AppState) => ({
    isOpen: selectors.tocOpen(state),
  }),
  (dispatch: Dispatch): {openToc: typeof actions['openToc'], closeToc: typeof actions['closeToc']} => ({
    closeToc: (...args) => dispatch(actions.closeToc(...args)),
    openToc: (...args) => dispatch(actions.openToc(...args)),
  })
)(SidebarControl);
