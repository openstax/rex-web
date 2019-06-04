import { createStandardAction } from 'typesafe-actions';
import { State } from './types';

export const receiveSearchResults = createStandardAction('Content/Search/receiveSearchResults')<State['results']>();
export const requestSearch = createStandardAction('Content/Search/requestSearch')<string>();
