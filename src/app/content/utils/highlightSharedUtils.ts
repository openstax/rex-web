import mapValues from 'lodash/fp/mapValues';
import pickBy from 'lodash/fp/pickBy';
import { isDefined } from '../../guards';
import { CountsPerSource } from '../types';

export const extractTotalCounts = (countsPerSource: CountsPerSource) =>
  mapValues(pickBy<CountsPerSource>(isDefined), countsPerSource);
