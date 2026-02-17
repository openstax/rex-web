import * as Cookies from 'js-cookie';
import React from 'react';
import { useSelector } from 'react-redux';
import styled, { AnyStyledComponent,  css, keyframes } from 'styled-components';
import { Times } from 'styled-icons/fa-solid/Times';
import { useAnalyticsEvent } from '../../../../../helpers/analytics';
import { user as userSelector } from '../../../../auth/selectors';
import { PlainButton } from '../../../../components/Button';
import htmlMessage from '../../../../components/htmlMessage';
import { bodyCopyRegularStyle } from '../../../../components/Typography';
import theme from '../../../../theme';
import { assertWindow } from '../../../../utils';
import { disablePrint } from '../../../components/utils/disablePrint';

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

const Wrapper = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  z-index: ${theme.zIndex.highlightsHelpInfoMobile};
  ${bodyCopyRegularStyle}
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  height: 6rem;
  padding: 0 2rem;
  background-color: ${theme.color.neutral.formBackground};
  border: 1px solid ${theme.color.neutral.formBorder};
  ${slideInAnimation}

  @media screen and (min-width: ${theme.breakpoints.mobileBreak}em) {
    display: none;
  }

  ${disablePrint}
`;

export const CloseIcon = styled(Times as AnyStyledComponent)`
  color: ${theme.color.secondary.lightGray.darkest};
  width: 1.4rem;
`;

export const cookieId = 'highlights_help_info_dissmised';
export const timeBeforeShow = 1000;

const Message = htmlMessage(
  'i18n:toolbar:highlights:popup:help-info',
  (props) => <span {...props} />);

const HighlightsHelpInfo = () => {
  const [show, setShow] = React.useState(false);
  const user = useSelector(userSelector);
  const trackShowHelpInfo = useAnalyticsEvent('showHelpInfo');

  const dismiss = () => {
    Cookies.set(cookieId, 'true');
    setShow(false);
  };

  React.useEffect(() => {
    setTimeout(() => {
      if (
        Boolean(Cookies.get(cookieId))
        || !assertWindow().matchMedia(theme.breakpoints.mobileQuery).matches
      ) { return; }
      setShow(true);
      trackShowHelpInfo();
    }, timeBeforeShow);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!show || !user) { return null; }

  return <Wrapper data-analytics-region='Mobile MH help info'>
    <Message />
    <PlainButton onClick={dismiss} data-analytics-label='close' aria-label='dismiss'>
      <CloseIcon />
    </PlainButton>
  </Wrapper>;
};

export default HighlightsHelpInfo;
