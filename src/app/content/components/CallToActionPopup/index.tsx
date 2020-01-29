import React from 'react';
import { FormattedMessage } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import { loginLink as loginLinkSelector, signupLink as signupLinkSelector } from '../../../auth/selectors';
import Button from '../../../components/Button';
import htmlMessage from '../../../components/htmlMessage';
import { closeCallToActionPopup } from '../../actions';
import { showCTAPopup } from '../../selectors';
import {
  CTABackground,
  CTABottomLayer,
  CTAButtons,
  CTACloseButton,
  CTACloseIcon,
  CTAContent,
  CTAGraphic,
  CTAHeading,
  CTAMiddleLayer,
  CTAParagraph,
  CTATextLink,
  CTATopLayer,
  CTAWrapper,
} from './styles';

// tslint:disable-next-line: variable-name
const CallToActionPopup = () => {
  const dispatch = useDispatch();
  const showPopup = useSelector(showCTAPopup);
  const loginLink = useSelector(loginLinkSelector);
  const signupLink = useSelector(signupLinkSelector);

  if (!showPopup) { return null; }

  const closePopup = () => {
    dispatch(closeCallToActionPopup());
  };

  return <CTAWrapper data-analytics-region='signup CTA'>
    <CTAContent>
      <div>
        <CTAHeading>
          <FormattedMessage id='i18n:cta:heading'>
            {(msg: Element | string) => msg}
          </FormattedMessage>
        </CTAHeading>
        <CtaPara />
        <CTAButtons>
          <FormattedMessage id='i18n:cta:button:signup'>
            {(msg: Element | string) => <Button
              data-testid='sign-up'
              data-analytics-label='sign-up'
              size='large'
              variant='primary'
              // eslint-disable-next-line
              component={<a href={signupLink}/>}
            >{msg}</Button>}
          </FormattedMessage>
          <CTATextLink>
            <FormattedMessage id='i18n:cta:button:separator'>
              {(msg: Element | string) => msg}
            </FormattedMessage>
            <FormattedMessage id='i18n:cta:button:login'>
              {(msg: Element | string) => <a
                data-testid='log-in'
                data-analytics-label='log-in'
                href={loginLink}
              >{msg}</a>}
            </FormattedMessage>
          </CTATextLink>
        </CTAButtons>
      </div>
      <CTAGraphic />
    </CTAContent>
    <CTACloseButton onClick={closePopup} data-analytics-label='close'>
      <CTACloseIcon />
    </CTACloseButton>
    <CTABackground>
      <CTABottomLayer />
      <CTAMiddleLayer />
      <CTATopLayer />
    </CTABackground>
  </CTAWrapper>;
};

export default CallToActionPopup;

// tslint:disable-next-line: variable-name
const CtaPara = htmlMessage('i18n:cta:text', CTAParagraph);
