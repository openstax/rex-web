
import mapValues from 'lodash/fp/mapValues';
import pickBy from 'lodash/fp/pickBy';
import { isDefined } from '../../../guards';
import { CountsPerSource } from '../../highlights/types';
import createSummaryHighlightsLoader from './createSummaryHighlightsLoader';
import extractDataFromHighlightClientResponse from './extractDataFromHighlightClientResponse';
import getHighlightLocationFilterForPage from './getHighlightLocationFilterForPage';

const extractTotalCounts = (countsPerSource: CountsPerSource) =>
  mapValues(pickBy<CountsPerSource>(isDefined), countsPerSource);

export {
  createSummaryHighlightsLoader,
  getHighlightLocationFilterForPage,
  extractDataFromHighlightClientResponse,
  extractTotalCounts,
};
