import { AppState } from '../../types';
import { practiceQuestionsFeatureFlag } from '../constants';
import { modalUrlName } from './constants';
import * as selectors from './selectors';

const initialState = {
  currentQuestionIndex: null,
  loading: false,
  questionAnswers: {},
  questions: [],
  selectedSection: null,
  summary: null,
};

describe('isPracticeQuestionsOpen', () => {
  it('returns true if has practice questions and has modal url and ff is enabled', () => {
    const rootState = ({
      content: {
        practiceQuestions: {
          ...initialState,
          summary: { countsPerSource: { asd: 1 } },
        },
      },
      featureFlags: {
        [practiceQuestionsFeatureFlag]: true,
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
      featureFlags: {
        [practiceQuestionsFeatureFlag]: true,
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
      featureFlags: {
        [practiceQuestionsFeatureFlag]: true,
      },
      navigation: {
        query: {},
      },
    } as any) as AppState;

    expect(selectors.isPracticeQuestionsOpen(rootState)).toBe(false);
  });

  it('returns false if ff is not enabled', () => {
    const rootState = ({
      content: {
        practiceQuestions: {
          ...initialState,
          summary: { countsPerSource: { asd: 1 } },
        },
      },
      featureFlags: {
      },
      navigation: {
        query: {
          modal: modalUrlName,
        },
      },
    } as any) as AppState;

    expect(selectors.isPracticeQuestionsOpen(rootState)).toBe(false);
  });
});
