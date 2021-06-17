import { createStandardAction } from 'typesafe-actions';

export const receiveFeatureFlags = createStandardAction('FeatureFlags/receiveFeatureFlags')<string[]>();
export const receiveExperiments = createStandardAction('FeatureFlags/receiveExperiments')<string[]>();
