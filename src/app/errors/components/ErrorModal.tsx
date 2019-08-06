import React from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';
import { AppState } from '../../types';
import Button from '../../components/Button';
import { Dispatch } from '../../types';
import { clearCurrentError } from '../actions';
import Card from '../../components/Card';
import { currentError } from '../selectors';
import ErrorCard from './ErrorCard';
import theme from '../../theme';

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
const ModalBody = styled(ErrorCard)`
  z-index: 3;
`;

interface Props {
  error?: Error;
  clearError: () => void;
}

// tslint:disable-next-line:variable-name
const ErrorModal: React.SFC<Props> = ({ error, clearError }) => {
  if (!error) { return null; }

  return (
    <Modal className="error-modal">
      <ModalBody
        error={error}
        footer={
          <Card.Footer>
            <Button
              onClick={clearError}
              variant='primary'
            >
              Dismiss
            </Button>
          </Card.Footer>
        }
      />
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
