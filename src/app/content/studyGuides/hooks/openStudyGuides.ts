import { ActionHookBody } from '../../../types';
import { actionHook } from '../../../utils';
import { loadMoreStudyGuides, openStudyGuides, setDefaultSummaryFilters } from '../actions';
import * as select from '../selectors';

export const hookBody: ActionHookBody<typeof openStudyGuides> = (services) => async() => {
  const state = services.getState();
  const filtersHaveBeenSet = select.filtersHaveBeenSet(state);
  const currentFilters = select.summaryLocationFilters(state);
  const defaultFilter = select.defaultLocationFilter(state);

  if (!filtersHaveBeenSet && defaultFilter && !currentFilters.has(defaultFilter.id)) {
    services.dispatch(setDefaultSummaryFilters({locationIds: [defaultFilter.id]}));
  } else {
    const studyGuides = select.summaryStudyGuides(state);
    const studyGuidesAreLoading = select.summaryIsLoading(state);

    if (studyGuides === null && studyGuidesAreLoading === false) {
      services.dispatch(loadMoreStudyGuides());
    }
  }
};

export const openStudyGuidesHook = actionHook(openStudyGuides, hookBody);
