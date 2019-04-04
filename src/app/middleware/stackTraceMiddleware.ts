import StackTrace from 'stacktrace-js';
import { AnyAction, Dispatch, Middleware } from '../types';

const stackTraceMiddleware: Middleware = () => (next: Dispatch) => (action: AnyAction) =>
  StackTrace.get().then((stack) => {
    (action as any).trace = stack.slice(2);
    next(action);
  });

export default stackTraceMiddleware;
