import React from 'react';
import { FormattedMessage } from 'react-intl';
import { assertWindow, useOnDOMEvent, useTimeout } from '../../../utils';
import { Header } from '../Card';
import {
  BannerBody,
  BannerBodyWrapper,
  clearErrorAfter,
  CloseButton,
  CloseIcon
} from './styles';

const removeNotificaion = () => null;

const window = assertWindow();

// tslint:disable-next-line:variable-name
const SearchFailure = () => {
  const [isFadingOut, setIsFadingOut] = React.useState(false);

  const startFadeOut = () => setIsFadingOut(true);

  useTimeout(clearErrorAfter, startFadeOut, []);

  useOnDOMEvent(window, !isFadingOut, 'click', startFadeOut);
  useOnDOMEvent(window, !isFadingOut, 'scroll', startFadeOut);

  return (
    <BannerBodyWrapper
      data-testid='banner-body'
      onAnimationEnd={removeNotificaion}
      isFadingOut={isFadingOut}
    >
      <BannerBody>
        <FormattedMessage id='i18n:notification:search-failure'>
          {(txt) =>  <Header>{txt}</Header>}
        </FormattedMessage>
        <CloseButton onClick={removeNotificaion}>
          <CloseIcon />
        </CloseButton>
      </BannerBody>
    </BannerBodyWrapper>
  );
};

export default SearchFailure;
