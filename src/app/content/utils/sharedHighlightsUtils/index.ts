
import mapValues from 'lodash/fp/mapValues';
import pickBy from 'lodash/fp/pickBy';
import { isDefined } from '../../../guards';
import { CountsPerSource } from '../../types';
import createSummaryHighlightsLoader from './createSummaryHighlightsLoader';
import extractDataFromHighlightClientResponse from './extractDataFromHighlightClientResponse';
import getHighlightLocationFilterForPage from './getHighlightLocationFilterForPage';
import loadAllHighlights from './loadAllHighlights'

const extractTotalCounts = (countsPerSource: CountsPerSource) =>
  mapValues(pickBy<CountsPerSource>(isDefined), countsPerSource);

export {
  createSummaryHighlightsLoader,
  getHighlightLocationFilterForPage,
  extractDataFromHighlightClientResponse,
  extractTotalCounts,
  loadAllHighlights,
};
