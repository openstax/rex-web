import { GetHighlightsSummarySourceTypeEnum } from '@openstax/highlighter/dist/api';
import { ActionHookBody } from '../../../types';
import { actionHook, assertDefined } from '../../../utils';
import { summaryPageSize } from '../../constants';
import * as selectContent from '../../selectors';
import { initializeMyHighlightsSummary, receiveHighlightsTotalCounts, receiveSummaryHighlights } from '../actions';
import { highlightLocationFilters } from '../selectors';
import { extractTotalCounts } from '../utils/paginationUtils';
import { loadMore } from './loadMore';

export const hookBody: ActionHookBody<typeof initializeMyHighlightsSummary> = (services) => async() => {
  const { dispatch, getState, highlightClient } = services;
  const state = getState();

  // this can only be undefined in dev if you press the MH button before book is loaded, whatever
  const book = assertDefined(selectContent.book(state), 'book should be defined');
  const locationFilters = highlightLocationFilters(state);

  const totalCounts = await highlightClient.getHighlightsSummary({
    scopeId: book.id,
    sourceType: GetHighlightsSummarySourceTypeEnum.OpenstaxPage,
  });

  const countsPerSource = assertDefined(totalCounts.countsPerSource, 'summary response is invalid');

  dispatch(receiveHighlightsTotalCounts(
    extractTotalCounts(countsPerSource),
    locationFilters
  ));

  const {formattedHighlights, pagination} = await loadMore(services, summaryPageSize);
  dispatch(receiveSummaryHighlights(formattedHighlights, {pagination}));
};

export const initializeMyHighlightsSummaryHook = actionHook(initializeMyHighlightsSummary, hookBody);
