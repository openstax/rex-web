import React, { ReactNode } from 'react';
import { FormattedMessage } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import Sentry from '../../../helpers/Sentry';
import Footer from '../../components/Footer';
import { supportCenterLink } from '../../components/Footer';
import htmlMessage from '../../components/htmlMessage';
import { H2 } from '../../components/Typography';
import { AppState } from '../../types';
import { recordError } from '../actions';
import { getMessageIdStack } from '../selectors';
import ErrorIdList from './ErrorIdList';
import './ErrorBoundary.css';

interface Props {
  children: ReactNode;
  recordError: (error: Error) => void;
  stack: string[];
  handlePromiseRejection?: boolean;
}

interface State {
  error?: Error;
}

// Simple wrapper component to replace styled component
function BodyErrorText(props: React.HTMLAttributes<HTMLDivElement>) {
  return <div {...props} className="body-error-text" />;
}

const BodyWithLink = htmlMessage('i18n:error:boundary:body', BodyErrorText);

// Error display component using hooks
interface ErrorDisplayProps {
  stack: string[];
}

function ErrorDisplay({ stack }: ErrorDisplayProps) {
  return (
    <React.Fragment>
      <div className="error-wrapper">
        <div className="heading-wrapper">
          <FormattedMessage id='i18n:error:boundary:sub-heading'>
            {(msg) => <H2>{msg}</H2>}
          </FormattedMessage>
        </div>
        <BodyWithLink values={{supportCenterLink}}/>
        <ErrorIdList ids={stack} />
      </div>
      <Footer />
    </React.Fragment>
  );
}

// Error Boundary class component (must be a class to use componentDidCatch)
class ErrorBoundaryClass extends React.Component<Props, State> {
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
      return <ErrorDisplay stack={this.props.stack} />;
    }
    return this.props.children;
  }

  private handleRejection = (event: PromiseRejectionEvent) => {
    event.preventDefault();
    this.componentDidCatch(event.reason);
  };
}

// Wrapper component using hooks to connect to Redux
function ErrorBoundary({
  children,
  handlePromiseRejection,
}: { children: ReactNode; handlePromiseRejection?: boolean }) {
  const dispatch = useDispatch();
  const stack = useSelector((state: AppState) => getMessageIdStack(state));

  const handleRecordError = (error: Error) => {
    dispatch(recordError(error));
  };

  return (
    <ErrorBoundaryClass
      recordError={handleRecordError}
      stack={stack}
      handlePromiseRejection={handlePromiseRejection}
    >
      {children}
    </ErrorBoundaryClass>
  );
}

export default ErrorBoundary;
