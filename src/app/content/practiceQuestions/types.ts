import { LinkedArchiveTreeSection } from '../types';

export interface State {
  isEnabled: boolean;
  summary: PracticeQuestionsSummary | null;
  selectedSection: LinkedArchiveTreeSection | null;
  currentQuestionIndex: number | null;
  questions: PracticeQuestion[];
  questionAnswers: QuestionAnswers;
  loading: boolean;
}

export interface PracticeQuestionsSummary {
  countsPerSource: {
    [key: string]: number;
  };
}

export interface PracticeAnswer {
  id: number;
  content_html: string;
  correctness: '0.0' | '1.0';
  feedback_html: string;
}

export interface PracticeQuestion {
  group_uuid: string;
  uid: string;
  stem_html: string;
  answers: PracticeAnswer[];
}

export type PracticeQuestions = PracticeQuestion[];

export interface QuestionAnswers {
  [key: string]: PracticeAnswer | null;
}

export interface SetPracticeAnswer {
  questionId: string;
  answer: PracticeAnswer | null;
}
