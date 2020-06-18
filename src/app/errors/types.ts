export interface State {
  code?: number;
  showDialog: boolean;
  error?: Error;
  sentryMessageIdStack: string[];
}
