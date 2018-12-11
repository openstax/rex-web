import { createStandardAction } from 'typesafe-actions';
import { ArchiveBook, ArchivePage, State } from './types';

export const openToc = createStandardAction('Content/openToc')<void>();
export const closeToc = createStandardAction('Content/closeToc')<void>();

export const requestBook = createStandardAction('Content/requestBook')<string>();
export const receiveBook = createStandardAction('Content/receiveBook')<ArchiveBook>();

export const requestPage = createStandardAction('Content/requestPage')<string>();
export const receivePage = createStandardAction('Content/receivePage')<
  ArchivePage & {references: State['references']}
>();
