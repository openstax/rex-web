import { ActionHookBody } from '../../../types';
import { actionHook } from '../../../utils';
import * as contentSelectors from '../../selectors';
import { setQuestions, setSelectedSection } from '../actions';
import * as practiceSelectors from '../selectors';

export const hookBody: ActionHookBody<typeof setSelectedSection> = ({
  dispatch, getState, practiceQuestionsLoader,
}) => async({ payload: section }) => {
  const state = getState();
  const book = contentSelectors.book(state);
  const summary = practiceSelectors.practiceQuestionsSummary(state);

  if (!book || !section || !summary) { return; }

  const questions = summary.countsPerSource[section.id]
    ? await practiceQuestionsLoader.getPracticeQuestions(book.id, section.id) || []
    : [];
  dispatch(setQuestions(questions));
};

export const setSelectedSectionHook = actionHook(setSelectedSection, hookBody);
