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
const SearchFailure = ({dismiss}: Props) => {
  const autoCloseTimeout = React.useRef<number | null>(null);
  const [isFadingOut, setIsFadingOut] = React.useState(false);

  const startFadeOut = () => {
    cleanup();
    setIsFadingOut(true);
  };

  const cleanup = () => {
    const window = assertWindow();

    window.removeEventListener('click', startFadeOut);
    window.removeEventListener('scroll', startFadeOut);
    if (autoCloseTimeout.current) {
      clearTimeout(autoCloseTimeout.current);
    }
  };

  React.useEffect(() => {
    autoCloseTimeout.current = setTimeout(startFadeOut, clearErrorAfter);

    const window = assertWindow();

    window.addEventListener('click', startFadeOut);
    window.addEventListener('scroll', startFadeOut);

    return () => cleanup();
  }, []);

  return (
    <BannerBodyWrapper
      data-testid='banner-body'
      onAnimationEnd={dismiss}
      isFadingOut={isFadingOut}
    >
      <BannerBody>
        <FormattedMessage id='i18n:notification:search-failure'>
          {(txt) =>  <Header>{txt}</Header>}
        </FormattedMessage>
        <CloseButton onClick={dismiss}>
          <CloseIcon />
        </CloseButton>
      </BannerBody>
    </BannerBodyWrapper>
  );
};

export default connect(undefined,
  (dispatch: Dispatch, ownProps: {notification: ActionType<typeof searchFailure>}) => ({
    dismiss: () => {
      dispatch(dismissNotification(ownProps.notification));
    },
  })
)(SearchFailure);
