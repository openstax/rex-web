import React from 'react';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { AppState, Dispatch } from '../../types';
import { assertString } from '../../utils';
import * as actions from '../actions';
import * as selectors from '../selectors';

interface Props {
  isOpen: boolean;
  openToc: typeof actions['openToc'];
  closeToc: typeof actions['closeToc'];
}

// tslint:disable-next-line:variable-name
const SidebarControl: React.SFC<Props> = ({isOpen, closeToc, openToc}) =>
  <FormattedMessage id={isOpen ? 'i18n:toc:toggle:opened' : 'i18n:toc:toggle:closed'}>
    {(msg: Element | string) => {
      const txt = assertString(msg, 'Aria label only supports strings');
      return <button
        style={{position: 'absolute', top: 0, right: 0}}
        aria-label={txt}
        onClick={() => isOpen ? closeToc() : openToc()}
      >toc</button>;
    }}
  </FormattedMessage>;

export default connect(
  (state: AppState) => ({
    isOpen:  selectors.tocOpen(state),
  }),
  (dispatch: Dispatch): {openToc: typeof actions['openToc'], closeToc: typeof actions['closeToc']} => ({
    closeToc:  (...args) => dispatch(actions.closeToc(...args)),
    openToc: (...args) => dispatch(actions.openToc(...args)),
  })
)(SidebarControl);
