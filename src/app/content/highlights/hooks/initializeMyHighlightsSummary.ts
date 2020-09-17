import { GetHighlightsSummarySourceTypeEnum, HighlightsSummary } from '@openstax/highlighter/dist/api';
import Sentry from '../../../../helpers/Sentry';
import { addToast } from '../../../notifications/actions';
import { ActionHookBody } from '../../../types';
import { actionHook, assertDefined } from '../../../utils';
import { summaryPageSize } from '../../constants';
import * as selectContent from '../../selectors';
import {
  initializeMyHighlightsSummary,
  receiveHighlightsTotalCounts,
  receiveSummaryHighlights,
  toggleSummaryHighlightsLoading,
} from '../actions';
import { highlightLocationFilters } from '../selectors';
import { extractTotalCounts } from '../utils/paginationUtils';
import { loadMore } from './loadMore';

export const hookBody: ActionHookBody<typeof initializeMyHighlightsSummary> = (services) => async() => {
  const { dispatch, getState, highlightClient } = services;
  const state = getState();

  // this can only be undefined in dev if you press the MH button before book is loaded, whatever
  const book = assertDefined(selectContent.book(state), 'book should be defined');
  const locationFilters = highlightLocationFilters(state);

  let totalCounts: HighlightsSummary | undefined;

  try {
    totalCounts = await highlightClient.getHighlightsSummary({
      scopeId: book.id,
      sourceType: GetHighlightsSummarySourceTypeEnum.OpenstaxPage,
    });
  } catch (error) {
    Sentry.captureException(error);
    dispatch(addToast({messageKey: 'i18n:notification:toast:highlights:load-failure'}));
    dispatch(toggleSummaryHighlightsLoading(false));
  }

  if (!totalCounts) { return; }

  const countsPerSource = assertDefined(totalCounts.countsPerSource, 'summary response is invalid');

  dispatch(receiveHighlightsTotalCounts(
    extractTotalCounts(countsPerSource),
    locationFilters
  ));

  const {formattedHighlights, pagination} = await loadMore(services, summaryPageSize);
  dispatch(receiveSummaryHighlights(formattedHighlights, {pagination}));
};

export const initializeMyHighlightsSummaryHook = actionHook(initializeMyHighlightsSummary, hookBody);
