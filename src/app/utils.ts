import { getType } from 'typesafe-actions';
import { AnyAction, AnyActionCreator, AppState, Dispatch, Middleware } from './types';

type Hook<C extends AnyActionCreator> = (helpers: {dispatch: Dispatch, getState: () => AppState }) => (action: ReturnType<C>) => Promise<any> | void;

export const actionHook = <C extends AnyActionCreator>(actionCreator: C, body: Hook<C>): Middleware => (stateHelpers) => {
  const boundHook = body(stateHelpers);

  const checkActionType = <A extends AnyAction>(action: A): action is ReturnType<C> => action.type === getType(actionCreator);

  return (next: Dispatch) => (action: AnyAction) => {
    const result = next(action);

    if (checkActionType(action)) {
      boundHook(action);
    }

    return result;
  };
};
