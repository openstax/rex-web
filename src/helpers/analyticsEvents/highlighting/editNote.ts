import { createSelector } from 'reselect';
import * as selectNavigation from '../../../app/navigation/selectors';
import { AnalyticsEvent } from '../event';

const editNote = 'REX highlighting - edit note';
const addNote = 'REX highlighting - add note';

export const selector = createSelector(
  selectNavigation.pathname,
  (pathname) => ({pathname})
);

export const track = (
  {pathname}: ReturnType<typeof selector>,
  addedNote: boolean,
  note: string
): AnalyticsEvent | void => {
  return {
    getGoogleAnalyticsPayload: () => ({
      eventAction: note,
      eventCategory: addedNote ? addNote : editNote,
      eventLabel: pathname,
    }),
  };
};
