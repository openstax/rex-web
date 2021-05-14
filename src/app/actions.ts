import { createStandardAction } from 'typesafe-actions';

export const receiveFeatureFlags = createStandardAction('app/receiveFeatureFlags')<string[]>();
export const receivePageFocus = createStandardAction('app/receivePageFocus')<boolean>();
