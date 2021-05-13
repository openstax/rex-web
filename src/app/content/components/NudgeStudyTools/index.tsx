import { HTMLElement } from '@openstax/types/lib.dom';
import React from 'react';
import { useIntl } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import { useAnalyticsEvent } from '../../../../helpers/analytics';
import htmlMessage from '../../../components/htmlMessage';
import { useMatchMobileQuery } from '../../../reactUtils';
import { assertDocument } from '../../../utils';
import { closeNudgeStudyTools, openNudgeStudyTools } from '../../actions';
import { showNudgeStudyTools } from '../../selectors';
import {
  hasStudyGuides as hasStudyGuidesSelector,
  studyGuidesEnabled as studyGuidesEnabledSelector,
  totalCountsPerPage as totalCountsPerPageSelector,
} from '../../studyGuides/selectors';
import arrowDesktop from './assets/arrowDesktop.svg';
import arrowMobile from './assets/arrowMobile.svg';
import {
  ClickBlocker,
  NudgeArrow,
  NudgeBackground,
  NudgeCloseButton,
  NudgeCloseIcon,
  NudgeContent,
  NudgeContentWrapper,
  NudgeHeading,
  NudgeTextStyles,
  NudgeWrapper,
} from './styles';
import {
  setNudgeStudyToolsCookies,
  shouldDisplayNudgeStudyTools,
  useIncrementPageCounter,
  usePositions,
} from './utils';

// tslint:disable-next-line: variable-name
const NudgeStudyTools = () => {
  const { formatMessage } = useIntl();
  const hasStudyGuides = useSelector(hasStudyGuidesSelector);
  const document = assertDocument();
  const wrapperRef = React.useRef<HTMLElement>(null);
  const isMobile = useMatchMobileQuery();
  const positions = usePositions(isMobile);
  const dispatch = useDispatch();

  React.useEffect(() => {
    if (positions) {
      document.body.style.overflow = 'hidden';
    }
    return () => { document.body.style.overflow = ''; };
    // document will not change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [positions]);

  React.useEffect(() => {
    const element = wrapperRef.current;
    if (positions && element) {
     element.focus();
    }
  }, [wrapperRef, positions]);

  if (!positions) { return null; }

  const ariaLabelKey = hasStudyGuides
    ? 'i18n:nudge:study-tools:aria-label:with-study-guides'
    : 'i18n:nudge:study-tools:aria-label:only-highlighting';

  return <NudgeWrapper data-analytics-region='Nudge Study Tools'>
    <NudgeArrow
      src={isMobile ? arrowMobile : arrowDesktop}
      alt=''
      top={positions.arrowTopOffset}
      left={positions.arrowLeft}
    />
    <NudgeCloseButton
      tabIndex={2}
      top={positions.closeButtonTopOffset}
      left={positions.closeButtonLeft}
      onClick={() => dispatch(closeNudgeStudyTools())}
      data-analytics-label='close'
    >
      <NudgeCloseIcon />
    </NudgeCloseButton>
    <NudgeContentWrapper
      ref={wrapperRef}
      tabIndex={1}
      data-testid={`nudge-${hasStudyGuides ? 'with-sg' : 'only-hl'}`}
      aria-label={formatMessage({id: ariaLabelKey})}
      top={positions.contentWrapperTopOffset}
      right={positions.contentWrapperRight}
    >
      <NudgeContent>
        <NudgeHeading />
        {hasStudyGuides
          ? <NudgeTextWithStudyGuides data-testid='nudge-text-with-sg' />
          : <NudgeTextOnlyHighlights data-testid='nudge-text-only-hl' />
        }
      </NudgeContent>
    </NudgeContentWrapper>
    <NudgeBackground
      top={positions.spotlightTopOffset}
      left={positions.spotlightLeftOffset}
      height={positions.spotlightHeight}
      width={positions.spotlightWidth}
    >
      <ClickBlocker area={'top'} />
      <ClickBlocker area={'right'} />
      <ClickBlocker area={'bottom'} />
      <ClickBlocker area={'left'} />
    </NudgeBackground>
  </NudgeWrapper>;
};

// tslint:disable-next-line: variable-name
const NudgeTextWithStudyGuides = htmlMessage('i18n:nudge:study-tools:text:with-study-guides', NudgeTextStyles);
// tslint:disable-next-line: variable-name
const NudgeTextOnlyHighlights = htmlMessage('i18n:nudge:study-tools:text:only-highlighting', NudgeTextStyles);

// Do not render <NudgeStudyTools/> if it is hidden so scroll listener is not attached
// to the DOM and do not render if document or window is undefined which may happen for prerendering.
// tslint:disable-next-line: variable-name
const NoopForPrerenderingAndForHiddenState = () => {
  const studyGuidesEnabled = useSelector(studyGuidesEnabledSelector);
  const totalCountsPerPage = useSelector(totalCountsPerPageSelector);
  const show = useSelector(showNudgeStudyTools);
  const trackOpen = useAnalyticsEvent('openNudgeStudyTools');
  const dispatch = useDispatch();
  const counter = useIncrementPageCounter();

  React.useEffect(() => {
    if (
      // If SG is enabled then show only when we've established state for study guides
      // to make sure we are showing correct nudge version
      (!studyGuidesEnabled || (studyGuidesEnabled && totalCountsPerPage !== null))
      && show === null
      && shouldDisplayNudgeStudyTools()
    ) {
      setNudgeStudyToolsCookies();
      trackOpen();
      dispatch(openNudgeStudyTools());
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show, counter, totalCountsPerPage, studyGuidesEnabled]);

  if (!show ) {
    return null;
  }

  return <NudgeStudyTools />;
};

export default NoopForPrerenderingAndForHiddenState;
