import flow from 'lodash/fp/flow';
import React, { ReactNode } from 'react';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import Sentry from '../../../helpers/Sentry';
import Footer from '../../components/Footer';
import { supportCenterLink } from '../../components/Footer';
import htmlMessage from '../../components/htmlMessage';
import { H2 } from '../../components/Typography';
import { AppState, Dispatch } from '../../types';
import { recordError } from '../actions';
import { getMessageIdStack } from '../selectors';
import ErrorIdList from './ErrorIdList';
import './ErrorBoundary.css';

interface Props {
  children: ReactNode;
  recordError: typeof recordError;
  stack: string[];
  handlePromiseRejection?: boolean;
}

interface State {
  error?: Error;
}

// Simple wrapper component to replace styled component
const BodyErrorText: React.FC<React.HTMLAttributes<HTMLDivElement>> = (props) => (
  <div {...props} className="body-error-text" />
);

const BodyWithLink = htmlMessage('i18n:error:boundary:body', BodyErrorText);

class ErrorBoundary extends React.Component<Props, State> {

  public state: State = { error: undefined };

  public componentDidCatch(error: Error) {
    Sentry.captureException(error);
    this.setState({ error });
    this.props.recordError(error);
  }

  public componentDidMount() {
    if (typeof(window) !== 'undefined' && this.props.handlePromiseRejection) {
      window.addEventListener('unhandledrejection', this.handleRejection);
    }
  }

  public componentWillUnmount() {
    if (typeof(window) !== 'undefined' && this.props.handlePromiseRejection) {
      window.removeEventListener('unhandledrejection', this.handleRejection);
    }
  }

  public render() {
    if (this.state.error) {
      return <React.Fragment>
        <div className="error-wrapper">
          <div className="heading-wrapper">
            <FormattedMessage id='i18n:error:boundary:sub-heading'>
              {(msg) => <H2>{msg}</H2>}
            </FormattedMessage>
          </div>
          <BodyWithLink values={{supportCenterLink}}/>
          <ErrorIdList ids={this.props.stack} />
        </div>
        <Footer />
      </React.Fragment>;
    }
    return this.props.children;
  }

  private handleRejection = (event: PromiseRejectionEvent) => {
    event.preventDefault();
    this.componentDidCatch(event.reason);
  };
}

export default connect(
  (state: AppState) => ({
    stack: getMessageIdStack(state),
  }),
  (dispatch: Dispatch) => ({
    recordError: flow(recordError, dispatch),
  })
)(ErrorBoundary);
