import { PracticeQuestions, PracticeQuestionsSummary } from '../app/content/practiceQuestions/types';

export default () => {
  return {
    getPracticeQuestions: async(bookId: string, sectionId: string): Promise<PracticeQuestions | undefined> => {
      try {
        const data = await import(`../../data/practice/questions/${bookId}/${sectionId}.json`);
        return data.default as PracticeQuestions;
      } catch {
        return undefined;
      }
    },
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
