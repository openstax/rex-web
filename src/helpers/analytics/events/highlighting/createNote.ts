import { createdHighlight } from '@openstax/event-capture-client/events';
import { createSelector } from 'reselect';
import { NewHighlightPayload } from '../../../../app/content/highlights/types';
import * as selectNavigation from '../../../../app/navigation/selectors';
import { AnalyticsEvent } from '../event';

const createNote = 'REX highlighting (inline create)';

export const selector = createSelector(
  selectNavigation.pathname,
  (pathname) => ({pathname})
);

export const track = (
  {pathname}: ReturnType<typeof selector>,
  highlight: NewHighlightPayload,
  {isDefaultColor}: {isDefaultColor?: boolean}
): AnalyticsEvent | void => {
  return {
    getEventCapturePayload: () => createdHighlight({
      ...highlight,
      annotation: highlight.annotation || '',
      highlightId: highlight.id,
      locationStrategies: JSON.stringify(highlight.locationStrategies),
      sourceMetadata: highlight.sourceMetadata || {},
    }),
    getGoogleAnalyticsPayload: () => ({
      eventAction: isDefaultColor ? 'default' : highlight.color,
      eventCategory: createNote,
      eventLabel: pathname,
    }),
  };
};
