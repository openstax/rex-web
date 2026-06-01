import React from 'react';
import { FormattedMessage } from 'react-intl';
import classNames from 'classnames';
import { useOnDOMEvent, useTimeout } from '../../../reactUtils';
import { assertWindow } from '../../../utils';
import { ToastNotification } from '../../types';
import { Header } from '../Card';
import Times from '../../../components/Times';
import { clearErrorAfter, shouldAutoDismissAfter, timeUntilFadeIn } from './constants';

// Note: ToastNotifications.css is imported globally from src/app/index.tsx to ensure
// consistent CSS ordering across code-split chunks

export type ToastVariant = 'error' | 'warning';

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
  variant?: ToastVariant;
}

// It's meant to not be dismissable before shouldAutoDismissAfter elapses
// then be dismissed after clearErrorAfter elapses or there is any interaction coming from the user
// If the interaction (selecting a search result) would actually cause searchHighlightManager to
// fail again, it will refresh the error instead

const Toast = ({ dismiss, notification, positionProps, variant}: ToastProps) => {
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

  const bannerBodyClass = classNames('banner-body', {
    'banner-body-error': variant !== 'warning',
    'banner-body-warning': variant === 'warning',
  });

  const closeButtonClass = classNames('toast-close-button', {
    'toast-close-button-error': variant !== 'warning',
    'toast-close-button-warning': variant === 'warning',
  });

  return (
    <div
      className="banner-body-wrapper"
      onAnimationEnd={dismiss}
      style={{ zIndex: positionProps.totalToastCount - positionProps.index }}
      data-fading-in={state.isFadingIn}
      data-fading-out={state.isFadingOut}
      data-testid='banner-body'
      role='alert'
    >
      <div className={bannerBodyClass}>
        <FormattedMessage id={notification.messageKey}>
          {(txt) =>  <Header className="toast-header">
            {txt}
            {
              notification.errorId
                ? <span className="toast-error-id">(ID: {notification.errorId})</span>
                : null
            }
          </Header>}
        </FormattedMessage>
        <button
          className={closeButtonClass}
          onClick={dismiss}
          aria-label='dismiss'
        >
          <Times className="toast-close-icon" aria-hidden='true' />
        </button>
      </div>
    </div>
  );
};

export default Toast;
