import React from 'react';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { ActionType } from 'typesafe-actions';
import { Dispatch } from '../../../types';
import { assertWindow } from '../../../utils';
import { dismissNotification, searchFailure,  } from '../../actions';
import { Header } from '../Card';
import {
  BannerBody,
  BannerBodyWrapper,
  clearErrorAfter,
  CloseButton,
  CloseIcon
} from './styles';

interface Props {
  dismiss: () => void;
}

// tslint:disable-next-line:variable-name
class SearchFailure extends React.Component<Props, {shouldFadeOut: boolean}> {
  public state = { shouldFadeOut: false };
  public autoClose: number;

  constructor(props: Props) {
    super(props);
    this.autoClose = setTimeout(this.startFadeOut, clearErrorAfter);
  }

  public componentDidMount() {
    const window = assertWindow();

    window.addEventListener('click', this.startFadeOut);
    window.addEventListener('scroll', this.startFadeOut);
  }

  public componentWillUnmount() {
    this.cleanup();
  }

  public cleanup() {
    const window = assertWindow();

    window.removeEventListener('click', this.startFadeOut);
    window.removeEventListener('scroll', this.startFadeOut);
    clearTimeout(this.autoClose);
  }

  public startFadeOut = () => {
    this.cleanup();
    this.setState({
      shouldFadeOut: true,
    });
  };

  public render() {
    return (
      <BannerBodyWrapper
        data-testid='banner-body'
        onAnimationEnd={this.props.dismiss}
        shouldFadeOut={this.state.shouldFadeOut}
      >
        <BannerBody>
          <FormattedMessage id='i18n:notification:search-failure'>
            {(txt) =>  <Header>{txt}</Header>}
          </FormattedMessage>
          <CloseButton onClick={this.props.dismiss}>
            <CloseIcon />
          </CloseButton>
        </BannerBody>
      </BannerBodyWrapper>
    );
  }
}

export default connect(undefined,
  (dispatch: Dispatch, ownProps: {notification: ActionType<typeof searchFailure>}) => ({
    dismiss: () => {
      dispatch(dismissNotification(ownProps.notification));
    },
  })
)(SearchFailure);
