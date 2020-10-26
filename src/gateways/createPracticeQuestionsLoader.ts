import { PracticeQuestionsSummary } from '../app/content/practiceQuestions/types';
import mockPhysics from '../test/fixtures/practice/cce64fde-f448-43b8-ae88-27705cceb0da.json';

export default () => {
  return {
    getPracticeQuestionsBookSummary: (bookId: string): Promise<PracticeQuestionsSummary | undefined> => {
      return new Promise((resolve) => {
        if (bookId === 'cce64fde-f448-43b8-ae88-27705cceb0da') {
          return resolve(mockPhysics as PracticeQuestionsSummary);
        }
        return resolve(undefined);
      });
    },
  };
};
