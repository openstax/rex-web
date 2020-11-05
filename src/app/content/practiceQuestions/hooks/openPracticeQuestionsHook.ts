import { ActionHookBody } from '../../../types';
import { actionHook } from '../../../utils';
import { isLinkedArchiveTreeSection } from '../../guards';
import * as contentSelectors from '../../selectors';
import { findArchiveTreeNodeById } from '../../utils/archiveTreeUtils';
import { openPracticeQuestions, setSelectedSection } from '../actions';
import * as pqSelectors from '../selectors';

export const hookBody: ActionHookBody<typeof openPracticeQuestions> = ({dispatch, getState}) => () => {
  const state = getState();
  const { book, page } = contentSelectors.bookAndPage(state);
  const hasPracticeQuestions = pqSelectors.hasPracticeQuestions(state);

  if (!book || !page || !hasPracticeQuestions) { return; }

  const section = findArchiveTreeNodeById(book.tree, page.id);
  if (section && isLinkedArchiveTreeSection(section)) {
    dispatch(setSelectedSection(section));
  }
};

export const openPracticeQuestionsHook = actionHook(openPracticeQuestions, hookBody);
