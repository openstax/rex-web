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
  selectedHighlight: null | string;
}

const initialState = {
  isFadingOut: false,
  shouldAutoDismiss: false,
};

export const syncState = (prevState: typeof initialState) => {
  return prevState.shouldAutoDismiss ? {...prevState, isFadingOut: true} : prevState;
};

// Appears when search searchHighlightManager in PageComponent.tsx fails to handle
// selecting a search result or when HighlightScrollTarget can't be find on a page.
// It's meant to not be dismissable before shouldAutoDismissAfter elapses
// then be dismissed after clearErrorAfter elapses or there is any interaction coming from the user
// If the interaction (selecting a search result) would actually cause searchHighlightManager to
// fail again, it will refresh the error instead

// tslint:disable-next-line:variable-name
const SearchOrHighlightFailure = ({ messageKey, dismiss, mobileToolbarOpen, selectedHighlight }: Props) => {
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

  React.useLayoutEffect(() => {
    resetErrorClearing();
    resetAutoDismiss();
    setFadeOutState(initialState);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedHighlight]);

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
};

export default SearchOrHighlightFailure;
