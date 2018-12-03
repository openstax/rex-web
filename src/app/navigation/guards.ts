import { AnyHistoryAction, HistoryActionWithParams, HistoryActionWithState } from './types';

export const hasParams = (payload: AnyHistoryAction): payload is HistoryActionWithParams<any> =>
  (payload as HistoryActionWithParams<any>).params !== undefined;

export const hasState = (payload: AnyHistoryAction): payload is HistoryActionWithState<any> =>
  (payload as HistoryActionWithState<any>).state !== undefined;
