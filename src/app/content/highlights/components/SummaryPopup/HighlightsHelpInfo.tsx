import * as Cookies from 'js-cookie';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import styled, { css, keyframes } from 'styled-components';
import { Times } from 'styled-icons/fa-solid/Times/Times';
import { PlainButton } from '../../../../components/Button';
import { linkStyle, textRegularStyle } from '../../../../components/Typography';
import theme from '../../../../theme';
import { assertWindow } from '../../../../utils';

// This is copied from CallToActionPopup > styles.tsx
// Wher should we store this kind of functions?
const slideInFromBottom = keyframes`
  0% {
    bottom: -100%;
  }

  100% {
    bottom: 0;
  }
`;

const slideInAnimation = css`
  animation: ${800}ms ${slideInFromBottom} ease-out;
`;

// tslint:disable-next-line: variable-name
const Wrapper = styled.div`
  position: fixed;
  bottom: 0;
  z-index: ${theme.zIndex.highlightsHelpInfoMobile};
  ${textRegularStyle}
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  height: 6rem;
  padding: 0 2rem;
  background-color: ${theme.color.neutral.formBackground};
  border: 1px solid ${theme.color.neutral.formBorder};
  ${slideInAnimation}

  a {
    ${linkStyle}
    text-decoration: none;
  }
`;

// tslint:disable-next-line: variable-name
export const CloseIcon = styled(Times)`
  color: ${theme.color.secondary.lightGray.darkest};
  width: 1.4rem;
`;

export const cookieId = 'highlights_help_info_dissmised';
export const timeBeforeShow = 1000;
// tslint:disable-next-line: max-line-length
const supportCenterLink = 'https://openstax.secure.force.com/help/articles/FAQ/Using-the-highlighting-and-note-taking-feature-on-mobile-or-tablet?search=highlighting';

// tslint:disable-next-line:variable-name
const HighlightsHelpInfo = () => {
  const [show, setShow] = React.useState(false);

  const dismiss = () => {
    Cookies.set(cookieId, 'true');
    setShow(false);
  };

  React.useEffect(() => {
    setTimeout(() => {
      if (!Boolean(Cookies.get(cookieId)) && assertWindow().matchMedia(theme.breakpoints.mobileQuery).matches) {
        setShow(true);
      }
    }, timeBeforeShow);
  }, []);

  if (!show) { return null; }

  return <Wrapper data-analytics-region='Mobile MH help info'>
    <span>
    <FormattedMessage id='i18n:toolbar:highlights:popup:help-info'/>
      <FormattedMessage id='i18n:toolbar:highlights:popup:help-info:link'>
        {(msg: Element | string) => <a
          data-testid='support-link'
          data-analytics-label='support-link'
          href={supportCenterLink}
        >{msg}</a>}
      </FormattedMessage>
    </span>
    <PlainButton onClick={dismiss} data-analytics-label='close'>
      <CloseIcon />
    </PlainButton>
  </Wrapper>;
};

export default HighlightsHelpInfo;
