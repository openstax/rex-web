import { HTMLElement, Event } from '@openstax/types/lib.dom';
import React from 'react';
import { useIntl } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import { useAnalyticsEvent } from '../../../../helpers/analytics';
import htmlMessage from '../../../components/htmlMessage';
import { onKey, useMatchMobileMediumQuery } from '../../../reactUtils';
import { assertDocument } from '../../../utils';
import { closeNudgeStudyTools, openNudgeStudyTools } from '../../actions';
import { showNudgeStudyTools } from '../../selectors';
import {
  hasStudyGuides as hasStudyGuidesSelector,
  studyGuidesEnabled as studyGuidesEnabledSelector,
  totalCountsPerPage as totalCountsPerPageSelector,
} from '../../studyGuides/selectors';
import arrow from './assets/arrow.svg';
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
import { nudgeStudyToolsTargetId } from './constants';

const NudgeStudyTools = ({
  positions,
}: {
  positions: Exclude<ReturnType<typeof usePositions>, null>;
}) => {
  const { formatMessage } = useIntl();
  const hasStudyGuides = useSelector(hasStudyGuidesSelector);
  const document = assertDocument();
  const wrapperRef = React.useRef<HTMLElement>(null);
  const dispatch = useDispatch();
  const dismiss = React.useCallback(
    () => {
      dispatch(closeNudgeStudyTools());
    },
    [dispatch]
  );
  const [addOnEscListener, removeOnEscListener] = onKey(
    {key: 'Escape'},
    document.body,
    dismiss
  );

  React.useEffect(() => {
    addOnEscListener();
    return removeOnEscListener;
  }, [addOnEscListener, removeOnEscListener]);

  React.useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
    // document will not change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [positions]);

  React.useEffect(() => {
    const element = wrapperRef.current;
    if (element) {
     element.focus();
    }
  }, [wrapperRef, positions]);

  const ariaLabelKey = hasStudyGuides
    ? 'i18n:nudge:study-tools:aria-label:with-study-guides'
    : 'i18n:nudge:study-tools:aria-label:only-highlighting';

  return <NudgeWrapper data-analytics-region='Nudge Study Tools' data-async-content>
    <NudgeArrow
      src={arrow}
      alt=''
      top={positions.arrowTopOffset}
      left={positions.arrowLeft}
    />
    <CloseButtonHoldingFocus positions={positions} dismiss={dismiss} />
    <NudgeContentWrapper
      ref={wrapperRef}
      tabIndex={1}
      data-testid={`nudge-${hasStudyGuides ? 'with-sg' : 'only-hl'}`}
      aria-label={formatMessage({id: ariaLabelKey})}
      top={positions.contentWrapperTopOffset}
      left={positions.contentWrapperLeft}
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

function useTabNavigationInterceptor() {
  const ref = React.useRef<HTMLElement>();
  const isMobile = useMatchMobileMediumQuery();

  React.useEffect(
    () => {
      if (isMobile) {
        return;
      }
      const document = assertDocument();
      const exposedElements: (Element | null | undefined)[] = [
        ref.current,
        ...Array.from(document.querySelectorAll(`#${nudgeStudyToolsTargetId} > button`)),
      ];
      const handleTabbing = (event: Event) => {
        if ('key' in event && event.key === 'Tab') {
          event.preventDefault();
          const focusIndex = exposedElements.indexOf(document.activeElement);
          if ('shiftKey' in event && event.shiftKey) {
            const newIndex = (focusIndex + exposedElements.length - 1) % exposedElements.length;

            (exposedElements[newIndex] as HTMLElement)?.focus();
          } else {
            const newIndex = (focusIndex + 1) % exposedElements.length;

            (exposedElements[newIndex] as HTMLElement)?.focus();
          }
        }
        if ('key' in event && (event.key as string).startsWith('Arrow')) {
          event.preventDefault();
        }
      };
      document.body.addEventListener('keydown', handleTabbing);
      return () => document.body.removeEventListener('keydown', handleTabbing);
    },
    [isMobile]
  );

  return ref;
}

function CloseButtonHoldingFocus({
  positions,
  dismiss,
}: {
  positions: Exclude<ReturnType<typeof usePositions>, null>;
  dismiss: () => void;
}) {
  const tabNavigationInterceptor = useTabNavigationInterceptor();

  return (
    <NudgeCloseButton
      top={positions.closeButtonTopOffset}
      left={positions.closeButtonLeft}
      onClick={dismiss}
      data-analytics-label='close'
      aria-label='close overlay'
      title='close overlay'
      ref={tabNavigationInterceptor}
    >
      <NudgeCloseIcon />
    </NudgeCloseButton>
  );
}

const NudgeTextWithStudyGuides = htmlMessage('i18n:nudge:study-tools:text:with-study-guides', NudgeTextStyles);
const NudgeTextOnlyHighlights = htmlMessage('i18n:nudge:study-tools:text:only-highlighting', NudgeTextStyles);

// Do not render <NudgeStudyTools/> if it is hidden so scroll listener is not attached
// to the DOM and do not render if document or window is undefined which may happen for prerendering.
const NoopForPrerenderingAndForHiddenState = () => {
  const studyGuidesEnabled = useSelector(studyGuidesEnabledSelector);
  const totalCountsPerPage = useSelector(totalCountsPerPageSelector);
  const hasStudyGuides = useSelector(hasStudyGuidesSelector);
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
      const target = hasStudyGuides ? 'study_guides' : 'highlights';
      trackOpen(target);
      dispatch(openNudgeStudyTools());
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show, counter, totalCountsPerPage, studyGuidesEnabled]);

  if (!show) {
    return null;
  }

  return <MaybeNudgeStudyTools />;
};

// This has to be separate from the function above because it requires
// window to be defined.
function MaybeNudgeStudyTools() {
  const isMobile = useMatchMobileMediumQuery();
  const positions = usePositions(isMobile);

  if (!positions) {
    return null;
  }

  return (
    <NudgeStudyTools positions={positions} />
  );
}

export default NoopForPrerenderingAndForHiddenState;
