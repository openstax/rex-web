import { createSelector } from 'reselect';
import * as selectNavigation from '../../../app/navigation/selectors';
import { AnalyticsEvent } from './event';

// const eventName = 'REX page focus';

export const selector = createSelector(
  selectNavigation.pathname,
  (pathname) => ({pathname})
);

export const track = (
  // @ts-ignore
  {pathname}: ReturnType<typeof selector>,
  // @ts-ignore
  focused: boolean
): AnalyticsEvent | void => {
  return {};
};
