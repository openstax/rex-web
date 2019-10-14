import { createStandardAction } from 'typesafe-actions';

export const receiveFeatureFlags = createStandardAction('app/receiveFeatureFlags')<string[]>();
