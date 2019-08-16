import React, { ReactNode } from 'react';
import styled from 'styled-components/macro';
import Sentry from '../../../helpers/Sentry';
import ErrorCard from './ErrorCard';

interface Props {
  children: ReactNode;
}

interface State {
  error?: Error;
}

// tslint:disable-next-line:variable-name
const ErrorWrapper = styled(ErrorCard)`
  margin: 2rem auto;
`;

class ErrorBoundary extends React.Component<Props, State> {

  public state = { error: undefined };

  public componentDidCatch(error: Error) {
    Sentry.captureException(error);
    this.setState({ error });
  }

  public render() {
    if (this.state.error) {
      return (
        <ErrorWrapper error={this.state.error as any as Error} />
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
