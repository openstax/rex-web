import { AppState } from '../../types';
import { modalUrlName } from './constants';
import * as selectors from './selectors';

const initialState = {
  currentQuestionIndex: null,
  isEnabled: false,
  loading: false,
  questionAnswers: {},
  questions: [],
  selectedSection: null,
  summary: null,
};

describe('isPracticeQuestionsOpen', () => {
  it('returns true if has practice questions and has modal url', () => {
    const rootState = ({
    content: {
    practiceQuestions: {
      ...initialState,
      summary: { countsPerSource: { asd: 1 } },
      },
    },
    navigation: {
      query: {
        modal: modalUrlName,
      },
    },
    } as any) as AppState;

    expect(selectors.isPracticeQuestionsOpen(rootState)).toBe(true);
  });

  it('returns false if doesnt have practice questions', () => {
    const rootState = ({
      content: {
        practiceQuestions: {
          ...initialState,
          summary: null,
        },
      },
      navigation: {
        query: {
          modal: modalUrlName,
        },
      },
    } as any) as AppState;

    expect(selectors.isPracticeQuestionsOpen(rootState)).toBe(false);
  });

  it('returns false if doesnt have modal url', () => {
    const rootState = ({
      content: {
        practiceQuestions: {
          ...initialState,
          summary: { countsPerSource: { asd: 1 } },
        },
      },
      navigation: {
        query: {},
      },
    } as any) as AppState;

    expect(selectors.isPracticeQuestionsOpen(rootState)).toBe(false);
  });
});
