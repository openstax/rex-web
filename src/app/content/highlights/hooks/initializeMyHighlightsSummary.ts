import { GetHighlightsSummarySourceTypeEnum } from '@openstax/highlighter/dist/api';
import mapValues from 'lodash/fp/mapValues';
import pickBy from 'lodash/fp/pickBy';
import { isDefined } from '../../../guards';
import { ActionHookBody } from '../../../types';
import { actionHook, assertDefined } from '../../../utils';
import * as selectContent from '../../selectors';
import { initializeMyHighlightsSummary, receiveHighlightsTotalCounts } from '../actions';
import * as select from '../selectors';
import loadMore from './loadMore';

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
    mapValues((colorCounts) => pickBy(isDefined, colorCounts), countsPerSource),
    locationFilters));

  await loadMore(services);
};

export const initializeMyHighlightsSummaryHook = actionHook(initializeMyHighlightsSummary, hookBody);
