import { InfoResults } from '@openstax/open-search-client';
import { createStandardAction } from 'typesafe-actions';
import { Book } from '../content/types';

export const receiveBooks = createStandardAction('Developer/receiveBooks')<Book[]>();
export const receiveBook = createStandardAction('Developer/receiveBook')<Book>();
export const receiveSearchStatus = createStandardAction('Developer/receiveSearchStatus')<InfoResults>();
