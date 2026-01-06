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

const BodyErrorText = styled.div`
  padding: ${modalPadding * 0.5}rem 0;
`;

const BodyWithLink = htmlMessage('i18n:error:boundary:body', BodyErrorText);

interface PropTypes {
  show: boolean;
  error?: Error;
  stack: string[];
  clearError: () => void;
}

const ErrorModal = ({ show, clearError, stack }: PropTypes) => {
  if (!show) { return null; }

  return (
    <Modal className='error-modal' heading='i18n:error:boundary:heading' onModalClose={clearError}>
      <Body >
        <FormattedMessage id='i18n:error:boundary:sub-heading'>
          {(msg) => <BodyHeading id='modal-title'>{msg}</BodyHeading>}
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
