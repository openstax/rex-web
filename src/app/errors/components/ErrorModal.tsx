import React from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';
import Button from '../../components/Button';
import theme from '../../theme';
import { AppState } from '../../types';
import { Dispatch } from '../../types';
import { clearCurrentError } from '../actions';
import { currentError } from '../selectors';
import ErrorCard, { Footer } from './ErrorCard';

// tslint:disable-next-line:variable-name
const Mask = styled.div`
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  z-index: 2;
  position: fixed;
  background-color: black;
  opacity: 0.7;
`;

// tslint:disable-next-line:variable-name
const Modal = styled.div`
  top: 0;
  z-index: ${theme.zIndex.modal};
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  position: fixed;
`;

// tslint:disable-next-line:variable-name
const CardWrapper = styled.div`
  z-index: 3;
`;

interface PropTypes {
  error?: Error;
  clearError: () => void;
}

// tslint:disable-next-line:variable-name
const ErrorModal = ({ error, clearError }: PropTypes) => {
  if (!error) { return null; }

  return (
    <Modal className='error-modal'>
      <CardWrapper>
        <ErrorCard
          error={error}
          footer={
            <Footer>
              <Button
                data-testid='clear-error'
                onClick={clearError}
                variant='primary'
              >
                Dismiss
              </Button>
            </Footer>
          }
        />
      </CardWrapper>
      <Mask />
    </Modal>
  );
};

export default connect(
  (state: AppState) => ({ error: currentError(state) }),
  (dispatch: Dispatch) => ({
    clearError: () => dispatch(clearCurrentError()),
  })
)(ErrorModal);
