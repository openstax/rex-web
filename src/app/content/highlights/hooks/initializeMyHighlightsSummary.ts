import { GetHighlightsSummarySourceTypeEnum } from '@openstax/highlighter/dist/api';
import { ActionHookBody } from '../../../types';
import { actionHook, assertDefined } from '../../../utils';
import * as selectContent from '../../selectors';
import { initializeMyHighlightsSummary, receiveHighlightsTotalCounts } from '../actions';
import * as select from '../selectors';
import loadMore from './loadMore';

export const hookBody: ActionHookBody<typeof initializeMyHighlightsSummary> = (services) => async() => {
  const { dispatch, getState, highlightClient } = services;
  const state = getState();
  const book = selectContent.book(state);
  const locationFilters = select.highlightLocationFilters(state);

  if (!book) {
    return;
  }

  const totalCounts = await highlightClient.getHighlightsSummary({
    scopeId: book.id,
    sourceType: GetHighlightsSummarySourceTypeEnum.OpenstaxPage,
  });

  const countsPerSource = assertDefined(totalCounts.countsPerSource, 'summary response is invalid');

  dispatch(receiveHighlightsTotalCounts(countsPerSource, locationFilters));

  await loadMore(services);
};

export const initializeMyHighlightsSummaryHook = actionHook(initializeMyHighlightsSummary, hookBody);
