import Sentry from '../../../../helpers/Sentry';
import { AppServices, MiddlewareAPI } from '../../../types';
import { isLinkedArchiveTreeSection } from '../../guards';
import { bookAndPage } from '../../selectors';
import { Book } from '../../types';
import { findArchiveTreeNodeById } from '../../utils/archiveTreeUtils';
import { receivePracticeQuestionsSummary, setSelectedSection } from '../actions';
import { hasPracticeQuestions, practiceQuestionsEnabled } from '../selectors';
import { PracticeQuestionsSummary } from '../types';

// composed in /content/locationChange hook because it needs to happen after book load
const loadSummary = async(
  services: MiddlewareAPI & AppServices,
  book: Book
): Promise<PracticeQuestionsSummary | undefined> => {
  const hasCurrentPQ = hasPracticeQuestions(services.getState());
  if (hasCurrentPQ) { return; }
  try {
    return await services.practiceQuestionsLoader.getPracticeQuestionsBookSummary(book.id);
  } catch (error) {
    Sentry.captureException(error);
  }
};

const hookBody = (services: MiddlewareAPI & AppServices) => async() => {
  const state = services.getState();
  const { book, page } = bookAndPage(state);
  const isEnabled = practiceQuestionsEnabled(state);

  if (!book || !page || !isEnabled ) { return; }

  const practiceQuestionsSummary = await loadSummary(services, book);
  if (practiceQuestionsSummary) {
    services.dispatch(receivePracticeQuestionsSummary(practiceQuestionsSummary));
  }

  const hasCurrentPQ = hasPracticeQuestions(services.getState());
  if (!hasCurrentPQ) { return; }
  const section = findArchiveTreeNodeById(book.tree, page.id);

  if (section && isLinkedArchiveTreeSection(section)) {
    services.dispatch(setSelectedSection(section));
  }
};

export default hookBody;
