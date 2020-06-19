import { HTMLElement } from '@openstax/types/lib.dom';
import * as Cookies from 'js-cookie';
import React from 'react';
import ReactDOM from 'react-dom';
import { FormattedMessage } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import { useAnalyticsEvent } from '../../../../helpers/analytics';
import { useDebouncedMatchMobileQuery } from '../../../reactUtils';
import { assertDocument, assertNotNull } from '../../../utils';
import { closeNudgeStudyTools, openNudgeStudyTools } from '../../actions';
import { showNudgeStudyTools } from '../../selectors';
import { studyGuidesSummaryIsNotEmpty } from '../../studyGuides/selectors';
import arrowDesktop from './assets/arrowDesktop.svg';
import arrowMobile from './assets/arrowMobile.svg';
import {
  cookieNudgeStudyGuidesCounter,
  cookieNudgeStudyGuidesDate,
  nudgeStudyToolsShowLimit,
  timeIntervalBetweenShowingNudgeInMs,
} from './constants';
import {
  NudgeArrow,
  NudgeBackground,
  NudgeCloseButton,
  NudgeCloseIcon,
  NudgeContent,
  NudgeContentWrapper,
  NudgeHeading,
  NudgeSpotlight,
  NudgeText,
  NudgeWrapper,
} from './styles';
import { useGetStudyToolsTarget, usePositions } from './utils';

// tslint:disable-next-line: variable-name
const NudgeStudyTools = () => {
  const document = assertDocument();
  const body = assertNotNull(document.querySelector('body'), 'body element is not defined');
  const isMobile = useDebouncedMatchMobileQuery();
  const show = useSelector(showNudgeStudyTools);
  const target = useGetStudyToolsTarget();
  const positions = usePositions(target, isMobile);
  const hasStudyGuides = useSelector(studyGuidesSummaryIsNotEmpty);
  const trackOpen = useAnalyticsEvent('openNudgeStudyTools');
  const wrapperRef = React.useRef<HTMLElement>(null);
  const dispatch = useDispatch();

  React.useEffect(() => {
    if (show === null && hasStudyGuides) {
      const counter = Number(Cookies.get(cookieNudgeStudyGuidesCounter) || 0);
      const lastShownDate = Cookies.get(cookieNudgeStudyGuidesDate);
      const now = new Date();
      const passedAllowedInterval = Boolean(lastShownDate
        && (now.getTime() - new Date(lastShownDate).getTime()) > timeIntervalBetweenShowingNudgeInMs);

      if (
        counter < nudgeStudyToolsShowLimit
        && (!lastShownDate || passedAllowedInterval)
      ) {
        Cookies.set(cookieNudgeStudyGuidesCounter, (counter + 1).toString());
        Cookies.set(cookieNudgeStudyGuidesDate, now.toString());
        trackOpen();
        dispatch(openNudgeStudyTools());
      }
    }
  }, [show, hasStudyGuides, trackOpen, dispatch]);

  React.useEffect(() => {
    if (show && positions) {
      body.style.overflow = 'hidden';
    }
    return () => { body.style.overflow = null; };
  }, [body, show, positions]);

  React.useEffect(() => {
    if (show && positions && wrapperRef.current) {
      wrapperRef.current.focus();
    }
  }, [show, positions, wrapperRef]);

  if (!show || !target || !positions) { return null; }

  const close = () => {
    dispatch(closeNudgeStudyTools());
  };

  return ReactDOM.createPortal(<FormattedMessage id='i18n:nudge:study-tools:aria-label'>
    {(msg: string) => <NudgeWrapper
      ref={wrapperRef}
      tabIndex='-1'
      aria-label={msg}
      data-analytics-region='Nudge Study Tools'
    >
      <NudgeArrow
        src={isMobile ? arrowMobile : arrowDesktop}
        alt=''
        top={positions.arrowTopOffset}
        left={positions.arrowLeft}
      />
      <NudgeCloseButton
        top={positions.closeButtonTopOffset}
        left={positions.closeButtonLeft}
        onClick={close}
        data-analytics-label='close'
      >
        <NudgeCloseIcon />
      </NudgeCloseButton>
      <NudgeContentWrapper
        top={positions.contentWrapperTopOffset}
        right={positions.contentWrapperRight}
      >
        <NudgeContent>
          <NudgeHeading />
          <NudgeText />
        </NudgeContent>
      </NudgeContentWrapper>
      <NudgeBackground>
        <NudgeSpotlight
          top={positions.spotlightTopOffset}
          left={positions.spotlightLeftOffset}
          height={positions.spotlightHeight}
          width={positions.spotlightWidth}
        />
      </NudgeBackground>
    </NudgeWrapper>}
  </FormattedMessage>,
  body
  );
};

export default NudgeStudyTools;
