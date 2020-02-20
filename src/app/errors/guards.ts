import { ExternalError, RecordableError } from './types';

export const isExternalError = (recordableError: RecordableError): recordableError is ExternalError =>
  'error' in recordableError;
