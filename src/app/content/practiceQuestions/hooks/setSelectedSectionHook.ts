import { ActionHookBody } from '../../../types';
import { actionHook } from '../../../utils';
import * as contentSelectors from '../../selectors';
import { setQuestions, setSelectedSection } from '../actions';

export const hookBody: ActionHookBody<typeof setSelectedSection> = ({
  dispatch, getState, practiceQuestionsLoader,
}) => async({ payload: section }) => {
  const state = getState();
  const book = contentSelectors.book(state);

  if (!book || !section) { return; }

  const questions = await practiceQuestionsLoader.getPracticeQuestions(book.id, section.id) || [];
  dispatch(setQuestions(questions));
};

export const setSelectedSectionHook = actionHook(setSelectedSection, hookBody);
