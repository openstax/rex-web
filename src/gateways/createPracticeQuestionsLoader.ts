import { PracticeQuestionsSummary } from '../app/content/practiceQuestions/types';

export default (_url: string) => {
  return {
    getPracticeQuestionsBookSummary: (bookId: string) => Promise.resolve(
      require(`../test/fixtures/practice/${bookId}.json`) as PracticeQuestionsSummary | undefined
    ),
  };
};
