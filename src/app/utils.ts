import { getType } from 'typesafe-actions';
import {
  ActionHookBody,
  AnyAction,
  AnyActionCreator,
  AppServices,
  Dispatch,
  Middleware
} from './types';

export const checkActionType = <C extends AnyActionCreator>(actionCreator: C) =>
  <A extends AnyAction>(action: A): action is ReturnType<C> => action.type === getType(actionCreator);

export const actionHook = <C extends AnyActionCreator>(actionCreator: C, body: ActionHookBody<C>) =>
  (services: AppServices): Middleware => (stateHelpers) => {
    const boundHook = body({...stateHelpers, ...services});

    const matches = checkActionType(actionCreator);

    return (next: Dispatch) => (action: AnyAction) => {
      const result = next(action);

      if (matches(action)) {
        const promise = boundHook(action);

        if (promise) {
          services.promiseCollector.add(promise);
        }
      }

      return result;
    };
  };

/*
 * util for dealing with array and object index signatures
 * don't include undefined
 *
 * ref: https://github.com/Microsoft/TypeScript/issues/13778
 */
export const assertDefined = <X>(x: X, message: string) => {
  if (x === undefined) {
    throw new Error(message);
  }

  return x!;
};

export const assertString = <X>(x: X, message: string) => {
  if (typeof x !== 'string') {
    throw new Error(message);
  }

  return x;
}