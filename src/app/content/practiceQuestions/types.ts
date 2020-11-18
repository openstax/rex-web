import { LocationFilters } from '../components/popUp/ChapterFilter';
import { LinkedArchiveTreeSection } from '../types';

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
  uuid: string;
  stem_html: string;
  id: number;
  answers: PracticeAnswer[];
}

export type PracticeQuestions = PracticeQuestion[];

export type PracticeQuestionsLocationFilters = LocationFilters;
