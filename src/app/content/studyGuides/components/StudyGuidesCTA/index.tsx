import React from 'react';
import { FormattedMessage } from 'react-intl';
import { useSelector } from 'react-redux';
import {
  loggedOut,
  loginLink as loginLinkSelector,
  signupLink as signupLinkSelector,
} from '../../../../auth/selectors';
import htmlMessage from '../../../../components/htmlMessage';
import Button from '../../../../components/Button';
import theme from '../../../../theme';
import arrowDesktop from './assets/arrow-desktop.svg';
import arrowMobile from './assets/arrow-mobile.svg';
import './StudyGuidesCTA.css';

const StudyGuidesCTATitle = htmlMessage('i18n:studyguides:cta:title', (props) => (
  <h2 className="study-guides-cta-title" {...props} />
));

const StudyGuidesCTAInfo = htmlMessage('i18n:studyguides:cta:info', (props) => (
  <div className="study-guides-cta-info" {...props} />
));

const StudyGuidesCTA = () => {
  const isNotLoggedIn = useSelector(loggedOut);
  const loginLink = useSelector(loginLinkSelector);
  const signupLink = useSelector(signupLinkSelector);

  if (!isNotLoggedIn) { return null; }

  return (
    <div
      className="study-guides-cta-wrapper"
      style={{
        '--text-color-default': theme.color.text.default,
        '--deep-green-color': theme.color.secondary.deepGreen.base,
      } as React.CSSProperties}
    >
      <div className="study-guides-cta-inner-wrapper">
        <div className="study-guides-cta-content">
          <StudyGuidesCTATitle />
          <div className="study-guides-cta-buttons">
            <FormattedMessage id='i18n:studyguides:cta:button'>
              {(msg) => (
                <Button
                  className="study-guides-cta-button"
                  // eslint-disable-next-line jsx-a11y/anchor-has-content
                  component={<a href={signupLink} data-analytics-label='signup' />}
                  style={{
                    '--button-text-color': theme.color.text.white,
                    '--button-bg-color': theme.color.secondary.deepGreen.base,
                  } as React.CSSProperties}
                >
                  {msg}
                </Button>
              )}
            </FormattedMessage>
            <div className="study-guides-cta-buttons-secondary">
              <span className="study-guides-cta-separator">
                <FormattedMessage id='i18n:studyguides:cta:separator'>
                  {(msg) => msg}
                </FormattedMessage>
              </span>
              <FormattedMessage id='i18n:studyguides:cta:login'>
                {(msg) => (
                  <a
                    className="study-guides-cta-link"
                    data-analytics-label='login'
                    href={loginLink}
                  >
                    {msg}
                  </a>
                )}
              </FormattedMessage>
            </div>
          </div>
        </div>
        <div className="study-guides-cta-info-wrapper">
          <StudyGuidesCTAInfo />
          <img src={arrowDesktop} alt='' className="study-guides-cta-arrow-desktop" />
          <img src={arrowMobile} alt='' className="study-guides-cta-arrow-mobile" />
        </div>
      </div>
    </div>
  );
};

export default StudyGuidesCTA;
