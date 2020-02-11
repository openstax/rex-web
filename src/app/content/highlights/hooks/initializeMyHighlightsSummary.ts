import { GetHighlightsSummarySourceTypeEnum } from '@openstax/highlighter/dist/api';
import mapValues from 'lodash/fp/mapValues';
import pickBy from 'lodash/fp/pickBy';
import { isDefined } from '../../../guards';
import { ActionHookBody } from '../../../types';
import { actionHook, assertDefined } from '../../../utils';
import * as selectContent from '../../selectors';
import { initializeMyHighlightsSummary, receiveHighlightsTotalCounts, receiveSummaryHighlights } from '../actions';
import * as select from '../selectors';
import { CountsPerSource } from '../types';
import { loadUntilPageSize } from './loadMore';
import { loadMoreByFunction } from './utils';

export const hookBody: ActionHookBody<typeof initializeMyHighlightsSummary> = (services) => async() => {
  const { dispatch, getState, highlightClient } = services;
  const state = getState();

  // this can only be undefined in dev if you press the MH button before book is loaded, whatever
  const book = assertDefined(selectContent.book(state), 'book should be defined');
  const locationFilters = select.highlightLocationFilters(state);

  const totalCounts = await highlightClient.getHighlightsSummary({
    scopeId: book.id,
    sourceType: GetHighlightsSummarySourceTypeEnum.OpenstaxPage,
  });

  const countsPerSource = assertDefined(totalCounts.countsPerSource, 'summary response is invalid');

  dispatch(receiveHighlightsTotalCounts(
    mapValues(pickBy<CountsPerSource>(isDefined), countsPerSource),
    locationFilters
  ));

  const {formattedHighlights, pagination} = await loadMoreByFunction(loadUntilPageSize, services);
  dispatch(receiveSummaryHighlights(formattedHighlights, pagination));
};

export const initializeMyHighlightsSummaryHook = actionHook(initializeMyHighlightsSummary, hookBody);
