import React from 'react';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import styled from 'styled-components';
import { ListOl } from 'styled-icons/fa-solid/ListOl';
import { contentFont, textRegularSize } from '../../components/Typography';
import { AppState, Dispatch } from '../../types';
import { assertString } from '../../utils';
import * as actions from '../actions';
import * as selectors from '../selectors';
import { toolbarIconColor, toolbarIconStyles } from './Toolbar';

interface Props extends React.HTMLProps<HTMLButtonElement> {
  isOpen: boolean;
  onClick: () => void;
}

// tslint:disable-next-line:variable-name
const ListIcon = styled(ListOl)`
  ${toolbarIconStyles};
`;

// tslint:disable-next-line:variable-name
const ToCButtonText = styled.h3`
  font-family: ${contentFont};
  ${textRegularSize};
  color: ${toolbarIconColor};
  margin: 0;
  padding: 0;
`;

// tslint:disable-next-line:variable-name
const ToCButton = styled.button`
  border: none;
  padding: 0;
  margin: 0;
  overflow: visible;
  background: none;
  display: flex;
  align-items: center;
`;

// tslint:disable-next-line:variable-name
export const SidebarControl: React.SFC<Props> = ({isOpen, onClick}) =>
  <FormattedMessage id={isOpen ? 'i18n:toc:toggle:opened' : 'i18n:toc:toggle:closed'}>
    {(msg: Element | string) => {
      const txt = assertString(msg, 'Aria label only supports strings');
      return <ToCButton
        aria-label={txt}
        onClick={onClick}
      >
        <ListIcon/><ToCButtonText>Table of contents</ToCButtonText>
      </ToCButton>;
    }}
  </FormattedMessage>;

export default connect(
  (state: AppState) => ({
    isOpen:  selectors.tocOpen(state),
  }),
  (dispatch: Dispatch): {openToc: typeof actions['openToc'], closeToc: typeof actions['closeToc']} => ({
    closeToc:  (...args) => dispatch(actions.closeToc(...args)),
    openToc: (...args) => dispatch(actions.openToc(...args)),
  }),
  (stateProps, dispatchProps, ownProps) => ({
    ...stateProps,
    ...ownProps,
    onClick: () => stateProps.isOpen
      ? dispatchProps.closeToc()
      : dispatchProps.openToc(),
  })
)(SidebarControl);
