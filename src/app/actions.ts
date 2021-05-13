import { createStandardAction } from 'typesafe-actions';
import { Experiments } from '../helpers/pollUpdates';

export const receiveFeatureFlags = createStandardAction('app/receiveFeatureFlags')<string[]>();
export const receivePageFocus = createStandardAction('app/receivePageFocus')<boolean>();
export const receiveExperiments = createStandardAction('app/receiveExperiments')<Experiments>();
