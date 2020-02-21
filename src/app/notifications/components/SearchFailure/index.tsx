import React, { memo } from 'react';
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

interface Props {
  dismiss: () => void;
}

const window = assertWindow();

// tslint:disable-next-line:variable-name
const SearchFailure = memo(({ dismiss }: Props) => {
  const [isFadingOut, setIsFadingOut] = React.useState(false);

  const startFadeOut = () => setIsFadingOut(true);

  useTimeout(clearErrorAfter, startFadeOut, []);

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
}, () => {
  return true;
});

export default SearchFailure;
