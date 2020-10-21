export interface State {
  isEnabled: boolean;
  summary: PracticeQuestionsSummary | null;
}

export interface PracticeQuestionsSummary {
  countsPerSource: {
    [key: string]: number;
  };
}
