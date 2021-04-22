import Sentry from '../../../../helpers/Sentry';
import { query } from '../../../navigation/selectors';
import { AppServices, MiddlewareAPI } from '../../../types';
import { modalQueryParameterName } from '../../constants';
import { isLinkedArchiveTreeSection } from '../../guards';
import { bookAndPage } from '../../selectors';
import { Book, Page } from '../../types';
import { findArchiveTreeNodeById } from '../../utils/archiveTreeUtils';
import { receivePracticeQuestionsSummary, setSelectedSection } from '../actions';
import { modalUrlName } from '../constants';
import {
  hasPracticeQuestions,
  practiceQuestionsEnabled,
  practiceQuestionsSummary as practiceQuestionsSummarySelector,
  selectedSection as selectedSectionSelector,
} from '../selectors';

// composed in /content/locationChange hook because it needs to happen after book load
const loadAndDispatchSummary = async(
  services: MiddlewareAPI & AppServices,
  book: Book
) => {
  try {
    const practiceQuestionsSummary =  await services.practiceQuestionsLoader.getPracticeQuestionsBookSummary(book.id);
    if (practiceQuestionsSummary) {
      services.dispatch(receivePracticeQuestionsSummary(practiceQuestionsSummary));
    }
  } catch (error) {
    Sentry.captureException(error);
  }
};

const setSection = (services: MiddlewareAPI & AppServices, book?: Book, page?: Page) => {
  const state = services.getState();
  // loading hasPracticeQuestions beacuse the state could be changed by receivePracticeQuestionsSummary
  if (
    !hasPracticeQuestions(state)
    || query(state)[modalQueryParameterName] !== modalUrlName
    || !book
    || !page
  ) { return; }

  const section = findArchiveTreeNodeById(book.tree, page.id);
  if (section && isLinkedArchiveTreeSection(section)) {
    services.dispatch(setSelectedSection(section));
  }
};

/**
 * Load PQ summary only only if it wasn't already loaded.
 * Additionally set a section if locationChange was fired before feature flags were fetched.
 */
export const loadPracticeQuestionsSummaryHookBody = (services: MiddlewareAPI & AppServices) => async() => {
  const state = services.getState();
  const { book, page } = bookAndPage(state);
  const isEnabled = practiceQuestionsEnabled(state);
  const summary = practiceQuestionsSummarySelector(state);
  const selectedSection = selectedSectionSelector(state);

  if (!book || !page || !isEnabled || summary !== null) { return; }

  await loadAndDispatchSummary(services, book);

  if (!selectedSection) {
    setSection(services, book, page);
  }
};

const locationChangeHookBody = (services: MiddlewareAPI & AppServices) => async() => {
  const state = services.getState();
  const { book, page } = bookAndPage(state);

  await loadPracticeQuestionsSummaryHookBody(services)();

  setSection(services, book, page);
};

export default locationChangeHookBody;
