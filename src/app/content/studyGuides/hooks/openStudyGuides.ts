import { ActionHookBody } from '../../../types';
import { actionHook } from '../../../utils';
import { loadMoreStudyGuides, openStudyGuides } from '../actions';
import * as select from '../selectors';

export const hookBody: ActionHookBody<typeof openStudyGuides> = (services) => async() => {
  const state = services.getState();
  const loggedOutAndQueryMissingFirstChapter = select.loggedOutAndQueryMissingFirstChapter(state);
  const loggedInAndQueryMissingLocationIds = select.loggedInAndQueryMissingLocationIds(state);

  if (!loggedOutAndQueryMissingFirstChapter && !loggedInAndQueryMissingLocationIds) {
    const studyGuides = select.summaryStudyGuides(state);
    const studyGuidesAreLoading = select.summaryIsLoading(state);

    if (studyGuides === null && studyGuidesAreLoading === false) {
      services.dispatch(loadMoreStudyGuides());
    }
  }
};

export const openStudyGuidesHook = actionHook(openStudyGuides, hookBody);
