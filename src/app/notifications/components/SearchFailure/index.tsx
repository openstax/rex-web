import React from 'react';
import { FormattedMessage } from 'react-intl';
import { useOnDOMEvent, useTimeout } from '../../../reactUtils';
import { assertWindow } from '../../../utils';
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
const SearchFailure = ({ dismiss }: Props) => {
  const window = assertWindow();
  const [isFadingOut, setIsFadingOut] = React.useState(false);
  const [shouldAutoDismiss, setShouldAutoDismiss] = React.useState(false);

  const startFadeOut = () => {
    if (shouldAutoDismiss) {
      setIsFadingOut(true);
    }
  };

  useTimeout(clearErrorAfter, startFadeOut, []);
  useTimeout(100, () => setShouldAutoDismiss(true), []);

  useOnDOMEvent(window, !isFadingOut, 'click', startFadeOut);
  useOnDOMEvent(window, !isFadingOut, 'scroll', startFadeOut);

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

export default SearchFailure;
