import { createStandardAction } from 'typesafe-actions';

export const receivePageFocus = createStandardAction('app/receivePageFocus')<boolean>();
