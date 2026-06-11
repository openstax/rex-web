import * as Cookies from 'js-cookie';
import React from 'react';
import { useSelector } from 'react-redux';
import { useAnalyticsEvent } from '../../../../../helpers/analytics';
import { user as userSelector } from '../../../../auth/selectors';
import { PlainButton } from '../../../../components/Button';
import htmlMessage from '../../../../components/htmlMessage';
import { TimesIcon } from '../../../../components/icons/Times';
import theme from '../../../../theme';
import { assertWindow } from '../../../../utils';
import './HighlightsHelpInfo.css';

// Media query constant from theme.ts
const mobileQuery = theme.breakpoints.mobileQuery;

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
        || !assertWindow().matchMedia(mobileQuery).matches
      ) { return; }
      setShow(true);
      trackShowHelpInfo();
    }, timeBeforeShow);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!show || !user) { return null; }

  return <div
    className="highlights-help-info disable-print"
    data-analytics-region='Mobile MH help info'
    style={{
      zIndex: theme.zIndex.highlightsHelpInfoMobile,
      '--help-info-bg': theme.color.neutral.formBackground,
      '--help-info-border': theme.color.neutral.formBorder,
      '--help-info-color': theme.color.text.default,
      '--close-icon-color': theme.color.secondary.lightGray.darkest,
    } as React.CSSProperties}
  >
    <Message />
    <PlainButton onClick={dismiss} data-analytics-label='close' aria-label='dismiss'>
      <TimesIcon className="highlights-help-info__close-icon" />
    </PlainButton>
  </div>;
};

export default HighlightsHelpInfo;
