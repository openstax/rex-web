import flow from 'lodash/fp/flow';
import React, { ReactNode } from 'react';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import styled from 'styled-components/macro';
import Sentry from '../../../helpers/Sentry';
import Footer from '../../components/Footer';
import { supportCenterLink } from '../../components/Footer';
import htmlMessage from '../../components/htmlMessage';
import { bodyCopyRegularStyle } from '../../components/Typography';
import { H2 } from '../../components/Typography/headings';
import theme from '../../theme';
import { AppState, Dispatch } from '../../types';
import { recordError } from '../actions';
import { getMessageIdStack } from '../selectors';
import ErrorIdList from './ErrorIdList';

interface Props {
  children: ReactNode;
  recordError: typeof recordError;
  stack: string[];
  handlePromiseRejection?: boolean;
}

interface State {
  error?: Error;
}

const ErrorWrapper = styled.div`
  flex: 1;
  margin: 3rem auto;
  padding: 0 ${theme.padding.page.mobile}rem;
`;

const HeadingWrapper = styled.div`
  text-align: center;
  margin-top: 5rem;
`;

const BodyErrorText = styled.div`
  ${bodyCopyRegularStyle};
`;

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
        <ErrorWrapper error={this.state.error}>
          <HeadingWrapper>
            <FormattedMessage id='i18n:error:boundary:sub-heading'>
              {(msg: string) => <H2>{msg}</H2>}
            </FormattedMessage>
          </HeadingWrapper>
          <BodyWithLink values={{supportCenterLink}}/>
          <ErrorIdList ids={this.props.stack} />
        </ErrorWrapper>
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
