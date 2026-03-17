import * as Cookies from 'js-cookie';
import React from 'react';
import { useSelector } from 'react-redux';
import styled, { css, keyframes } from 'styled-components';
import { useAnalyticsEvent } from '../../../../../helpers/analytics';
import { user as userSelector } from '../../../../auth/selectors';
import { PlainButton } from '../../../../components/Button';
import htmlMessage from '../../../../components/htmlMessage';
import { bodyCopyRegularStyle } from '../../../../components/Typography';
import theme from '../../../../theme';
import { assertWindow } from '../../../../utils';
import { disablePrint } from '../../../components/utils/disablePrint';

interface IconProps extends React.SVGAttributes<SVGSVGElement> {
  className?: string;
}

/**
 * Times icon component.
 * SVG path from Font Awesome Free (https://fontawesome.com - MIT License)
 *
 * Note: Wrapped with styled() to enable styled-components component selector references
 */
function TimesBase({ className, ...props }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 352 512"
      aria-hidden="true"
      {...props}
    >
      <path
        fill="currentColor"
        d="M242.72 256l100.07-100.07c12.28-12.28 12.28-32.19 0-44.48l-22.24-22.24c-12.28-12.28-32.19-12.28-44.48 0L176 189.28 75.93 89.21c-12.28-12.28-32.19-12.28-44.48 0L9.21 111.45c-12.28 12.28-12.28 32.19 0 44.48L109.28 256 9.21 356.07c-12.28 12.28-12.28 32.19 0 44.48l22.24 22.24c12.28 12.28 32.2 12.28 44.48 0L176 322.72l100.07 100.07c12.28 12.28 32.2 12.28 44.48 0l22.24-22.24c12.28-12.28 12.28-32.19 0-44.48L242.72 256z"
      />
    </svg>
  );
}

const Times = styled(TimesBase)``;

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

export const CloseIcon = styled(Times)`
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
