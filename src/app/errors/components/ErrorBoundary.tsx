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

// the styled-componts typing currently has errors with
// styled(ErrorCard) otherwise we'd use that, couldn't figure out
// the magic typecasting to allow it
// tslint:disable-next-line:variable-name
const ErrorWrapper = styled.div`
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
        <ErrorWrapper>
          <ErrorCard error={this.state.error as any as Error} />
        </ErrorWrapper>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
