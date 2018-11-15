import { getType } from 'typesafe-actions';
import PromiseCollector from '../helpers/PromiseCollector';
import { AnyAction, AnyActionCreator, Dispatch, Middleware, MiddlewareAPI } from './types';

export const checkActionType = <C extends AnyActionCreator>(actionCreator: C) =>
  <A extends AnyAction>(action: A): action is ReturnType<C> => action.type === getType(actionCreator);

type Hook<C extends AnyActionCreator> = (helpers: MiddlewareAPI) => (action: ReturnType<C>) => Promise<any> | void;

export const actionHook = <C extends AnyActionCreator>(actionCreator: C, body: Hook<C>) =>
  (collector: PromiseCollector): Middleware => (stateHelpers) => {
    const boundHook = body(stateHelpers);

    const matches = checkActionType(actionCreator);

    return (next: Dispatch) => (action: AnyAction) => {
      const result = next(action);

      if (matches(action)) {
        const promise = boundHook(action);

        if (promise) {
          collector.add(promise);
        }
      }

      return result;
    };
  };
