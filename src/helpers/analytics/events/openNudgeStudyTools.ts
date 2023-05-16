import { nudged } from '@openstax/event-capture-client/events';
import { createSelector } from 'reselect';
import * as selectContent from '../../../app/content/selectors';
import * as selectNavigation from '../../../app/navigation/selectors';
import { AnalyticsEvent } from './event';

const nudge = 'Nudge Study Tools';

export const selector = createSelector(
  selectNavigation.pathname,
  selectContent.book,
  (pathname, book) => ({
    book,
    pathname,
  })
);

export const track = (
  {pathname, book}: ReturnType<typeof selector>,
  app: string,
  target: string
): AnalyticsEvent | void => {
  const getGoogleAnalyticsPayload = () => ({
    eventAction: 'open',
    eventCategory: nudge,
    eventLabel: pathname,
  });

  return book ? {
    getEventCapturePayload: () => nudged({
      app,
      target,
      context: book.id,
      flavor: 'full screen',
      medium: 'webview',
    }),
    getGoogleAnalyticsPayload,
  } : { getGoogleAnalyticsPayload };
};
