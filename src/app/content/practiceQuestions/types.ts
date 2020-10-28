export interface State {
  isEnabled: boolean;
  summary: PracticeQuestionsSummary | null;
  open: boolean;
}

export interface PracticeQuestionsSummary {
  countsPerSource: {
    [key: string]: number;
  };
}
