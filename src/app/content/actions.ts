import { createStandardAction } from 'typesafe-actions';
import { TextResizerValue } from './constants';
import * as highlightingActions from './highlights/actions';
import * as keyboardShortcutsActions from './keyboardShortcuts/actions';
import * as practiceQuestionsActions from './practiceQuestions/actions';
import * as searchActions from './search/actions';
import * as studyGuidesActions from './studyGuides/actions';
import { ArchivePage, Book, Params, State } from './types';

export const search = searchActions;
export const highlighting = highlightingActions;
export const studyGuides = studyGuidesActions;
export const practiceQuestions = practiceQuestionsActions;
export const keyboardShortcuts = keyboardShortcutsActions;

export const openToc = createStandardAction('Content/openToc')<void>();
export const closeToc = createStandardAction('Content/closeToc')<void>();
export const resetToc = createStandardAction('Content/resetToc')<void>();

export const openMobileMenu = createStandardAction('Content/openMobileMenu')<void>();
export const closeMobileMenu = createStandardAction('Content/closeMobileMenu')<void>();

export const requestBook = createStandardAction('Content/requestBook')<Params['book']>();
export const receiveBook = createStandardAction('Content/receiveBook')<Book>();

export const requestPage = createStandardAction('Content/requestPage')<Params['page']>();
export const receivePage = createStandardAction('Content/receivePage')<
  ArchivePage & {references: State['references']}
>();
export const receivePageNotFoundId = createStandardAction('Content/receivePageNotFoundId')<string>();

export const openNudgeStudyTools = createStandardAction('Content/openNudgeStudyTools')();
export const closeNudgeStudyTools = createStandardAction('Content/closeNudgeStudyTools')();

export const setTextSize = createStandardAction('Content/setTextSize')<TextResizerValue>();
export const setBookStylesUrl = createStandardAction('Content/setBookStylesUrl')<string>();
