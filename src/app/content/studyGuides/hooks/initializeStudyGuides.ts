import { GetHighlightsSummarySetsEnum, GetHighlightsSummarySourceTypeEnum } from '@openstax/highlighter/dist/api';
import { ActionHookBody } from '../../../types';
import { actionHook, assertDefined } from '../../../utils';
import { summaryPageSize } from '../../constants';
import { extractTotalCounts } from '../../highlights/utils/summaryHighlightsUtils';
import { bookAndPage } from '../../selectors';
import { openStudyGuides, receiveStudyGuidesSummary, receiveStudyGuidesTotalCounts } from '../actions';
import * as select from '../selectors';
import { loadMoreStudyGuidesHighlights } from './loadMore';

export const hookBody: ActionHookBody<typeof openStudyGuides> = (services) => async() => {
  const state = services.getState();

  const {book} = bookAndPage(state);
  const needsInitialization = () => select.studyGuidesEnabled(state)
    && select.summaryStudyGuidesHighlights(state) === null
    && select.summaryIsLoading(state) === false;

  if (!book || !needsInitialization()) { return; }

  const studyGuidesSummary = await services.highlightClient.getHighlightsSummary({
    scopeId: book.id,
    sets: [GetHighlightsSummarySetsEnum.Curatedopenstax],
    sourceType: GetHighlightsSummarySourceTypeEnum.OpenstaxPage,
  });

  const countsPerSource = assertDefined(studyGuidesSummary.countsPerSource, 'summary response is invalid');
  services.dispatch(receiveStudyGuidesTotalCounts(extractTotalCounts(countsPerSource)));

  const {formattedHighlights, pagination} = await loadMoreStudyGuidesHighlights(services, summaryPageSize);
  services.dispatch(receiveStudyGuidesSummary(formattedHighlights, pagination));
};

export const initializeMyHighlightsSummaryHook = actionHook(openStudyGuides, hookBody);
