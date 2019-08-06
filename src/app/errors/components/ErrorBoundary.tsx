import React, { ReactNode } from 'react';
import styled from 'styled-components';
import Sentry from '../../../helpers/Sentry';
import ErrorCard from './ErrorCard';

interface Props {
  children: ReactNode;
}

interface State {
  error?: Error;
}

// tslint:disable-next-line:variable-name
const ErrorContent = styled(ErrorCard)`
  margin: 2rem auto;
`;


class ErrorBoundary extends React.Component<Props, State> {

  public state = { error: undefined };

  public componentDidCatch(error: Error) {
    this.setState({ error });
    Sentry.captureException(error);
  }

  public render() {
    if (this.state.error) {
      return <ErrorContent error={this.state.error as any as Error} />;
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
