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
  dismiss: () => void;
  mobileToolbarOpen: boolean;
}

interface ModalRef {
  resetError: () => void;
}

const initialState = {
  isFadingOut: false,
  shouldAutoDismiss: false,
};

export const syncState = (prevState: typeof initialState) => {
  return prevState.shouldAutoDismiss ? {...prevState, isFadingOut: true} : prevState;
};

// Appears when search searchHighlightManager in PageComponent.tsx fails to handle
// selecting a search result. It's meant to not be dismissable before shouldAutoDismissAfter elapses
// then be dismissed after clearErrorAfter elapses or there is any interaction coming from the user
// If the interaction (selecting a search result) would actually cause searchHighlightManager to
// fail again, it will refresh the error instead

// tslint:disable-next-line:variable-name
const SearchFailure = React.forwardRef<ModalRef, Props>(({ dismiss, mobileToolbarOpen }, ref) => {
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
        <FormattedMessage id='i18n:notification:search-failure'>
          {(txt) =>  <Header>{txt}</Header>}
        </FormattedMessage>
        <CloseButton onClick={dismiss}>
          <CloseIcon />
        </CloseButton>
      </BannerBody>
    </BannerBodyWrapper>
  );
});

export default SearchFailure;
