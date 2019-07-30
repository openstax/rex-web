import React from 'react';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import styled from 'styled-components';
import { ExclamationTriangle } from 'styled-icons/fa-solid/ExclamationTriangle';
import Button from '../../components/Button';
import Card from '../../components/Card';
import theme from '../../theme';
import { AppState } from '../../types';
import { Dispatch } from '../../types';
import { clearCurrentError } from '../actions';
import { currentError } from '../selectors';

// tslint:disable-next-line:variable-name
const ErrorPanel = styled.div`
  color: white;
  padding: 1rem;
  margin-top: 2rem;
  font-size: 1.2rem;
  background-color: ${theme.color.secondary.lightGray.base};
`;

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
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  position: fixed;
`;

// tslint:disable-next-line:variable-name
const Body = styled(Card)`
  z-index: 3;
`;

interface Props {
  error?: Error;
  clearError: () => void;
}

// tslint:disable-next-line:variable-name
const ErrorCard: React.SFC<Props> = ({ error, clearError }) => {
  if (!error) { return null; }

  return (
    <Modal>
      <Body>
        <Card.Header>
          <FormattedMessage id='i18n:error:boundary:heading'>
            {(message) => (
              <Card.Heading>
                <ExclamationTriangle height='45px' color='red' /> {message}
              </Card.Heading>
            )}
          </FormattedMessage>
        </Card.Header>
        <Card.Body>
          <FormattedMessage id='i18n:error:boundary:body'>
            {(body) => (<div>{body}</div>)}
          </FormattedMessage>
          <ErrorPanel>
            {error.toString()}
          </ErrorPanel>
          <FormattedMessage id='i18n:error:boundary:action'>
            {(action) => (<p>{action}</p>)}
          </FormattedMessage>
        </Card.Body>
        <Card.Footer>
          <Button
            onClick={clearError}
            variant='primary'
          >
            Dismiss
          </Button>
        </Card.Footer>
      </Body>
      <Mask />
    </Modal>
  );
};

export default connect(
  (state: AppState) => ({ error: currentError(state) }),
  (dispatch: Dispatch) => ({
    clearError: () => dispatch(clearCurrentError()),
  })
)(ErrorCard);
