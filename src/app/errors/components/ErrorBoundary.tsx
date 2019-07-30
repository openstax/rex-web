import React, { ReactNode } from 'react';
import { connect } from 'react-redux';
import Sentry from '../../../helpers/Sentry';
import { Dispatch } from '../../types';
import { recordError } from '../actions';

interface Props {
  children: ReactNode;
  recordError: (error: Error) => void;
}

class ErrorBoundary extends React.Component<Props> {

  public componentDidCatch(error: Error) {
    this.props.recordError(error);
    // also log the error to an error reporting service
    Sentry.captureException(error);
  }

  public render() {
    return this.props.children;
  }
}

export default connect(
  () => ({}),
  (dispatch: Dispatch) => ({
    recordError: (err: Error) => dispatch(recordError(err)),
  })
)(ErrorBoundary);
