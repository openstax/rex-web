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

export const shouldAutoDismissAfter = 100;

interface Props {
  dismiss: () => void;
  mobileToolbarOpen: boolean;
  selectedHighlight: null | HighlightProp;
}

// tslint:disable-next-line:variable-name
const SearchFailure = ({ dismiss, mobileToolbarOpen, selectedHighlight }: Props) => {
  const window = assertWindow();
  const [isFadingOut, setIsFadingOut] = React.useState(false);
  const [shouldAutoDismiss, setShouldAutoDismiss] = React.useState(false);

  const startFadeOut = () => {
    if (shouldAutoDismiss) {
      setIsFadingOut(true);
    }
  };

  const resetErrorClearing = useTimeout(clearErrorAfter, startFadeOut, []);
  const resetAutoDimiss = useTimeout(shouldAutoDismissAfter, () => setShouldAutoDismiss(true), []);

  useOnDOMEvent(window, !isFadingOut, 'click', startFadeOut, [shouldAutoDismiss]);
  useOnDOMEvent(window, !isFadingOut, 'scroll', startFadeOut, [shouldAutoDismiss]);

  React.useEffect(() => {
    setIsFadingOut(false);
    setShouldAutoDismiss(false);
    resetAutoDimiss();
    resetErrorClearing();
  }, [selectedHighlight]);

  return (
    <BannerBodyWrapper
      data-testid='banner-body'
      onAnimationEnd={dismiss}
      mobileToolbarOpen={mobileToolbarOpen}
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

export default SearchFailure;
