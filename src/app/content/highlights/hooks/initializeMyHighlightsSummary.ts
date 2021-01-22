import { GetHighlightsSummarySourceTypeEnum, HighlightsSummary } from '@openstax/highlighter/dist/api';
import { makeApplicationError } from '../../../../helpers/applicationMessageError';
import { ActionHookBody, Unpromisify } from '../../../types';
import { actionHook, assertDefined } from '../../../utils';
import { summaryPageSize } from '../../constants';
import * as selectContent from '../../selectors';
import {
  initializeMyHighlightsSummary,
  receiveHighlightsTotalCounts,
  receiveSummaryHighlights,
  toggleSummaryHighlightsLoading
} from '../actions';
import { HighlightPopupLoadError } from '../errors';
import { highlightLocationFilters } from '../selectors';
import { extractTotalCounts } from '../utils/paginationUtils';
import { loadMore, LoadMoreResponse } from './loadMore';

export const hookBody: ActionHookBody<typeof initializeMyHighlightsSummary> = (services) => async() => {
  const { dispatch, getState, highlightClient } = services;
  const state = getState();

  // this can only be undefined in dev if you press the MH button before book is loaded, whatever
  const book = assertDefined(selectContent.book(state), 'book should be defined');
  const locationFilters = highlightLocationFilters(state);

  let totalCounts: HighlightsSummary;

  try {
    totalCounts = await highlightClient.getHighlightsSummary({
      scopeId: book.id,
      sourceType: GetHighlightsSummarySourceTypeEnum.OpenstaxPage,
    });
  } catch (error) {
    dispatch(toggleSummaryHighlightsLoading(false));
    throw makeApplicationError(error, new HighlightPopupLoadError({ destination: 'myHighlights' }));
  }

  const countsPerSource = assertDefined(totalCounts.countsPerSource, 'summary response is invalid');

  dispatch(receiveHighlightsTotalCounts(
    extractTotalCounts(countsPerSource),
    locationFilters
  ));

  let highlights: Unpromisify<LoadMoreResponse>;

  try {
    highlights = await loadMore(services, summaryPageSize);
  } catch (error) {
    dispatch(toggleSummaryHighlightsLoading(false));
    throw makeApplicationError(error, new HighlightPopupLoadError({destination: 'myHighlights'}));
  }

  const {formattedHighlights, pagination} = highlights;

  dispatch(receiveSummaryHighlights(formattedHighlights, {pagination}));
};

export const initializeMyHighlightsSummaryHook = actionHook(initializeMyHighlightsSummary, hookBody);
