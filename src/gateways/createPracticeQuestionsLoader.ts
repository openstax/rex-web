import { PracticeQuestionsSummary } from '../app/content/practiceQuestions/types';

export default () => {
  return {
    getPracticeQuestionsBookSummary: async(bookId: string): Promise<PracticeQuestionsSummary | undefined> => {
      try {
        const data = await import(`../../data/practice/summary/${bookId}.json`);
        return data.default as PracticeQuestionsSummary;
      } catch {
        return undefined;
      }
    },
  };
};
