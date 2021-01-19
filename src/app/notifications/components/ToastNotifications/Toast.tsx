import React from 'react';
import { FormattedMessage } from 'react-intl';
import { useOnDOMEvent, useTimeout } from '../../../reactUtils';
import { assertWindow } from '../../../utils';
import { ToastNotification } from '../../types';
import { Header } from '../Card';
import { clearErrorAfter, shouldAutoDismissAfter, timeUntilFadeIn } from './constants';
import {
  BannerBody,
  BannerBodyWrapper,
  CloseButton,
  CloseIcon,
  ErrorId,
} from './styles';

export const initialState = {
  isFadingIn: false,
  isFadingOut: false,
  shouldAutoDismiss: false,
};

type State = typeof initialState;
type AnimationEvents = 'start_fade_in' | 'start_fade_out' | 'reset_duration' | 'reposition' | 'allow_auto_dismiss';

export const manageAnimationState = (prevState: State, event: AnimationEvents): State => {
  switch (event) {
    case 'start_fade_in':
      return {
        ...prevState,
        isFadingIn: true,
      };
    case 'allow_auto_dismiss':
      return {
        ...prevState,
        isFadingOut: false,
        shouldAutoDismiss: true,
      };
    case 'start_fade_out':
      if (!prevState.shouldAutoDismiss) {
        return prevState;
      }
      return {...prevState, isFadingOut: true};
    case 'reposition':
      return {...prevState, isFadingIn: false};
    case 'reset_duration':
      return {...prevState, isFadingOut: false, shouldAutoDismiss: false};
    default:
      return initialState;
  }
};

export interface ToastProps {
  dismiss: () => void;
  notification: ToastNotification;
  positionProps: {
    index: number,
    totalToastCount: number
  };
}

// It's meant to not be dismissable before shouldAutoDismissAfter elapses
// then be dismissed after clearErrorAfter elapses or there is any interaction coming from the user
// If the interaction (selecting a search result) would actually cause searchHighlightManager to
// fail again, it will refresh the error instead

// tslint:disable-next-line:variable-name
const Toast = ({ dismiss, notification, positionProps}: ToastProps) => {
  const window = assertWindow();
  const [state, dispatch] = React.useReducer(manageAnimationState, initialState);

  const startFadeOut = () => {
    if (notification.shouldAutoDismiss) {
      dispatch('start_fade_out');
    }
  };

  const handlersEnabled = !state.isFadingOut && state.shouldAutoDismiss;

  useOnDOMEvent(window, handlersEnabled, 'click', startFadeOut);
  useOnDOMEvent(window, handlersEnabled, 'scroll', startFadeOut);

  const resetAutoDismiss = useTimeout(shouldAutoDismissAfter, () => dispatch('allow_auto_dismiss'));
  const resetErrorClearing = useTimeout(clearErrorAfter, startFadeOut);
  const restartFadeIn = useTimeout(timeUntilFadeIn, () => dispatch('start_fade_in'));

  React.useLayoutEffect(() => {
    restartFadeIn();
    dispatch('reposition');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [positionProps.index]);

  React.useLayoutEffect(() => {
    resetErrorClearing();
    resetAutoDismiss();
    dispatch('reset_duration');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notification.timestamp]);

  return (
    <BannerBodyWrapper
      onAnimationEnd={dismiss}
      positionProps={positionProps}
      isFadingIn={state.isFadingIn}
      isFadingOut={state.isFadingOut}
      data-testid='banner-body'
    >
      <BannerBody>
        <FormattedMessage id={notification.messageKey}>
          {(txt) =>  <Header>
            {txt}
            {
              notification.errorId
                ? <ErrorId>(ID: {notification.errorId} )</ErrorId>
                : null
            }
          </Header>}
        </FormattedMessage>
        <CloseButton onClick={dismiss}>
          <CloseIcon />
        </CloseButton>
      </BannerBody>
    </BannerBodyWrapper>
  );
};

export default Toast;
