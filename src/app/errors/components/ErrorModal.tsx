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
import { clearCurrentError } from '../actions';
import { currentError, getMessageIdStack } from '../selectors';

// tslint:disable-next-line:variable-name
const BodyErrorText = styled.div`
  padding: ${modalPadding * 0.5}rem 0;
`;

// tslint:disable-next-line:variable-name
const ErrorList = styled.ul`
  margin: 0;
  padding: 0;
`;

// tslint:disable-next-line:variable-name
const BodyWithLink = htmlMessage('i18n:error:boundary:body', BodyErrorText);

interface PropTypes {
  error?: Error;
  stack: string[];
  clearError: () => void;
}

// tslint:disable-next-line:variable-name
const ErrorModal = ({ error, clearError, stack }: PropTypes) => {
  if (!error) { return null; }

  return (
    <Modal className='error-modal' heading='i18n:error:boundary:heading' onModalClose={clearError}>
      <Body>
        <FormattedMessage id='i18n:error:boundary:sub-heading'>
          {(msg) => <BodyHeading>{msg}</BodyHeading>}
        </FormattedMessage>
        <BodyWithLink values={{supportCenterLink}}/>
        {stack.length ? <ErrorList>
          {stack.map((sentryErrorId) => <li key={sentryErrorId}>{sentryErrorId}</li>)}
        </ErrorList> : null}
      </Body>
      <Footer>
        <FormattedMessage id='i18n:error:boundary:action-btn-text'>
          {(msg) => <Button
            data-testid='clear-error'
            onClick={clearError}
            variant='primary'
            > {msg}
          </Button>}
        </FormattedMessage>
      </Footer>
    </Modal>
  );
};

export default connect(
  (state: AppState) => ({
    error: currentError(state),
    stack: getMessageIdStack(state),
  }),
  (dispatch: Dispatch) => ({
    clearError: () => dispatch(clearCurrentError()),
  })
)(ErrorModal);
