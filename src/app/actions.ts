import { createStandardAction } from 'typesafe-actions';

export const receiveFeatureFlags = createStandardAction('app/receiveFeatureFlags')<string[] | string>();
export const receivePageFocus = createStandardAction('app/receivePageFocus')<boolean>();
