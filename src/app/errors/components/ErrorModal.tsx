import React from 'react';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import styled from 'styled-components/macro';
import Button from '../../components/Button';
import { supportCenterLink } from '../../components/Footer';
import htmlMessage from '../../components/htmlMessage';
import Modal from '../../components/Modal';
import { Body, BodyHeading, Footer, modalPadding } from '../../components/Modal/styles';
import { AppState, Dispatch } from '../../types';
import { hideErrorDialog } from '../actions';
import * as select from '../selectors';
import ErrorIdList from './ErrorIdList';

// tslint:disable-next-line:variable-name
const BodyErrorText = styled.div`
  padding: ${modalPadding * 0.5}rem 0;
`;

// tslint:disable-next-line:variable-name
const BodyWithLink = htmlMessage('i18n:error:boundary:body', BodyErrorText);

interface PropTypes {
  show: boolean;
  error?: Error;
  stack: string[];
  clearError: () => void;
}

// tslint:disable-next-line:variable-name
const ErrorModal = ({ show, clearError, stack }: PropTypes) => {
  if (!show) { return null; }

  return (
    <Modal className='error-modal' heading='i18n:error:boundary:heading' onModalClose={clearError}>
      <Body >
        <h1 id='modal-title'>
          <FormattedMessage id='i18n:error:boundary:title'>
            {(msg) => msg}
          </FormattedMessage>
        </h1>
        <FormattedMessage id='i18n:error:boundary:sub-heading'>
          {(msg) => <BodyHeading>{msg}</BodyHeading>}
        </FormattedMessage>
        <BodyWithLink values={{supportCenterLink}}/>
        <ErrorIdList ids={stack} />
      </Body>
      <Footer>
        <FormattedMessage id='i18n:error:boundary:action-btn-text'>
          {(msg) => <Button
            data-testid='clear-error'
            onClick={clearError}
            variant='primary'
            >{msg}
          </Button>}
        </FormattedMessage>
      </Footer>
    </Modal>
  );
};

export default connect(
  (state: AppState) => ({
    show: select.showErrorDialog(state),
    stack: select.getMessageIdStack(state),
  }),
  (dispatch: Dispatch) => ({
    clearError: () => dispatch(hideErrorDialog()),
  })
)(ErrorModal);
