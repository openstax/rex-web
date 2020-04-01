import React from 'react';
import { FormattedMessage } from 'react-intl';
import { HighlightProp } from '../../../content/components/Page/searchHighlightManager';
import { useOnDOMEvent, useTimeout } from '../../../reactUtils';
import { assertWindow } from '../../../utils';
import { Header } from '../Card';
import {
  BannerBody,
  BannerBodyWrapper,
  clearErrorAfter,
  CloseButton,
  CloseIcon,
} from './styles';

export const shouldAutoDismissAfter = 3000;

interface Props {
  dismiss: () => void;
  mobileToolbarOpen: boolean;
  selectedHighlight: null | HighlightProp;
}

const initialState = {
  isFadingOut: false,
  shouldAutoDismiss: false,
};

export const syncState = (prevState: typeof initialState) => {
  return prevState.shouldAutoDismiss ? {...prevState, isFadingOut: true} : prevState;
};

// tslint:disable-next-line:variable-name
const SearchFailure = ({ dismiss, mobileToolbarOpen, selectedHighlight }: Props) => {
  const window = assertWindow();
  const [fadeOutState, setFadeOutState] = React.useState(initialState);

  const startFadeOut = () => {
    setFadeOutState(syncState);
  };

  const handlersEnabled = !fadeOutState.isFadingOut && fadeOutState.shouldAutoDismiss;

  useOnDOMEvent(window, handlersEnabled, 'click', startFadeOut);
  useOnDOMEvent(window, handlersEnabled, 'scroll', startFadeOut);

  const resetErrorClearing = useTimeout(clearErrorAfter, startFadeOut);
  const resetAutoDismiss = useTimeout(
    shouldAutoDismissAfter,
    () => setFadeOutState({...initialState, shouldAutoDismiss: true})
  );

  React.useLayoutEffect(() => {
    resetErrorClearing();
    resetAutoDismiss();
    setFadeOutState(initialState);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedHighlight, setFadeOutState]);

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
};

export default SearchFailure;
