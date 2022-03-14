import { createSelector } from 'reselect';
import * as selectNavigation from '../../../../app/navigation/selectors';
import { AnalyticsEvent } from '../event';

const editNote = 'REX highlighting (inline edit note)';
const addNote = 'REX highlighting (inline add note)';

const editNoteMH = 'REX highlighting (edit note) - MH popup';
const addNoteMH = 'REX highlighting (add note) - MH popup';

export const selector = createSelector(
  selectNavigation.pathname,
  (pathname) => ({pathname})
);

export const track = (
  {pathname}: ReturnType<typeof selector>,
  addedNote: boolean,
  note: string,
  isMH?: boolean
): AnalyticsEvent | void => {
  const category = addedNote ? (isMH ? addNoteMH : addNote) : (isMH ? editNoteMH : editNote);
  return {
    getGoogleAnalyticsPayload: () => ({
      eventAction: note,
      eventCategory: category,
      eventLabel: pathname,
    }),
  };
};
