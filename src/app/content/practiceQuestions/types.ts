import { LinkedArchiveTree, LinkedArchiveTreeSection } from '../types';

export interface State {
  isEnabled: boolean;
  summary: PracticeQuestionsSummary | null;
  open: boolean;
  selectedSection: LinkedArchiveTreeSection | null;
  currentQuestionIndex: number | null;
  questions: PracticeQuestion[];
}

export interface PracticeQuestionsSummary {
  countsPerSource: {
    [key: string]: number;
  };
}

interface PracticeAnswer {
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

export type PracticeQuestionsLocationFilters = Map<
  string,
  { section: LinkedArchiveTree, children: LinkedArchiveTreeSection[] }
>;
