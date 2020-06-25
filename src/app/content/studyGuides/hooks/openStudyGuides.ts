import { ActionHookBody } from '../../../types';
import { actionHook } from '../../../utils';
import { getHighlightLocationFilterForPage } from '../../highlights/utils';
import { loadMoreStudyGuides, openStudyGuides, setSummaryFilters } from '../actions';
import * as select from '../selectors';

export const hookBody: ActionHookBody<typeof openStudyGuides> = (services) => async() => {
  const state = services.getState();
  const page = state.content.page;
  const filters = select.studyGuidesLocationFilters(state);
  const location = page && getHighlightLocationFilterForPage(filters, page);

  if (location) {
    console.log(location);
    services.dispatch(setSummaryFilters({locationIds: [location.id]}));
  }

  const studyGuides = select.summaryStudyGuides(state);
  const studyGuidesAreLoading = select.summaryIsLoading(state);

  if (studyGuides === null && studyGuidesAreLoading === false) {
    services.dispatch(loadMoreStudyGuides());
  }
};

export const openStudyGuidesHook = actionHook(openStudyGuides, hookBody);
