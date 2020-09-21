import React from 'react';
import { FormattedMessage } from 'react-intl';
import { useOnDOMEvent, useTimeout } from '../../../reactUtils';
import { assertWindow } from '../../../utils';
import { Header } from '../Card';
import { clearErrorAfter, shouldAutoDismissAfter } from './constants';
import {
  BannerBody,
  BannerBodyWrapper,
  CloseButton,
  CloseIcon,
} from './styles';

interface Props {
  messageKey: string;
  dismiss: () => void;
  mobileToolbarOpen: boolean;
}

export interface ModalRef {
  resetError: () => void;
}

const initialState = {
  isFadingOut: false,
  shouldAutoDismiss: false,
};

export const syncState = (prevState: typeof initialState) => {
  return prevState.shouldAutoDismiss ? {...prevState, isFadingOut: true} : prevState;
};

// It's meant to not be dismissable before shouldAutoDismissAfter elapses
// then be dismissed after clearErrorAfter elapses or there is any interaction coming from the user
// If the interaction (for ex. selecting a search result) would actually cause update of this component
// then it will refresh the error

// tslint:disable-next-line:variable-name
const FlashMessageError = React.forwardRef<ModalRef, Props>(({ messageKey, dismiss, mobileToolbarOpen }, ref) => {
  const window = assertWindow();
  const [fadeOutState, setFadeOutState] = React.useState(initialState);

  const startFadeOut = () => {
    setFadeOutState(syncState);
  };

  const handlersEnabled = !fadeOutState.isFadingOut && fadeOutState.shouldAutoDismiss;

  useOnDOMEvent(window, handlersEnabled, 'click', startFadeOut);
  useOnDOMEvent(window, handlersEnabled, 'scroll', startFadeOut);

  const resetAutoDismiss = useTimeout(
    shouldAutoDismissAfter,
    () => setFadeOutState({...initialState, shouldAutoDismiss: true})
  );
  const resetErrorClearing = useTimeout(clearErrorAfter, startFadeOut);

  React.useImperativeHandle(ref, () => ({
    resetError: () => {
      resetErrorClearing();
      resetAutoDismiss();
      setFadeOutState(initialState);
    },
  }), [resetAutoDismiss, resetErrorClearing]);

  return (
    <BannerBodyWrapper
      data-testid='banner-body'
      onAnimationEnd={dismiss}
      mobileToolbarOpen={mobileToolbarOpen}
      isFadingOut={fadeOutState.isFadingOut}
    >
      <BannerBody>
        <FormattedMessage id={messageKey}>
          {(txt) =>  <Header>{txt}</Header>}
        </FormattedMessage>
        <CloseButton onClick={dismiss}>
          <CloseIcon />
        </CloseButton>
      </BannerBody>
    </BannerBodyWrapper>
  );
});

export default FlashMessageError;
