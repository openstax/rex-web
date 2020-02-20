export interface State {
  code?: number;
  error?: Error ;
  errorIdStack: string[];
}

interface InternalError {
  sentryErrorId?: string;
}

export interface ExternalError extends InternalError {
  error: Error;
}

export type RecordableError = InternalError | ExternalError;
