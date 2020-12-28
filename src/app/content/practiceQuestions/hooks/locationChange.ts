import Sentry from '../../../../helpers/Sentry';
import { query } from '../../../navigation/selectors';
import { AppServices, MiddlewareAPI } from '../../../types';
import { modalQueryParameterName } from '../../constants';
import { bookAndPage } from '../../selectors';
import { openPracticeQuestions, receivePracticeQuestionsSummary } from '../actions';
import { modalUrlName } from '../constants';
import { hasPracticeQuestions, practiceQuestionsEnabled } from '../selectors';
import { PracticeQuestionsSummary } from '../types';

// composed in /content/locationChange hook because it needs to happen after book load
const loadSummary = async(services: MiddlewareAPI & AppServices): Promise<PracticeQuestionsSummary | undefined> => {
  const state = services.getState();
  const {book} = bookAndPage(state);
  const isEnabled = practiceQuestionsEnabled(state);
  const hasCurrentPQ = hasPracticeQuestions(state);

  if (!isEnabled || !book || hasCurrentPQ) { return; }

  try {
    return await services.practiceQuestionsLoader.getPracticeQuestionsBookSummary(book.id);
  } catch (error) {
    Sentry.captureException(error);
  }
};

const hookBody = (services: MiddlewareAPI & AppServices) => async() => {
  const practiceQuestionsSummary = await loadSummary(services);

  if (!practiceQuestionsSummary) { return; }

  services.dispatch(receivePracticeQuestionsSummary(practiceQuestionsSummary));

  const navigationQuery = query(services.getState());
  if (navigationQuery[modalQueryParameterName] === modalUrlName) {
    services.dispatch(openPracticeQuestions());
  }
};

export default hookBody;
