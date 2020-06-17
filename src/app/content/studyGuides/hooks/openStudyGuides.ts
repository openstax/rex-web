import { ActionHookBody } from '../../../types';
import { actionHook } from '../../../utils';
import { openStudyGuides, receiveSummaryStudyGuides } from '../actions';
import * as select from '../selectors';
import { loadMore } from './loadMore';

export const hookBody: ActionHookBody<typeof openStudyGuides> = (services) => async() => {
  const state = services.getState();
  const studyGuides = select.summaryStudyGuides(state);
  const studyGuidesAreLoading = select.summaryIsLoading(state);

  if (studyGuides === null && studyGuidesAreLoading === false) {
    const {formattedHighlights, pagination} = await loadMore(services);

    services.dispatch(receiveSummaryStudyGuides(formattedHighlights, pagination));
  }
};

export const openStudyGuidesHook = actionHook(openStudyGuides, hookBody);
