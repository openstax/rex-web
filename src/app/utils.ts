import { Document } from '@openstax/types/lib.dom';
import React, { Ref } from 'react';
import { getType } from 'typesafe-actions';
import { ApplicationMesssageError } from '../helpers/applicationMessageError';
import Sentry from '../helpers/Sentry';
import { receiveLoggedOut } from './auth/actions';
import { recordError, showErrorDialog } from './errors/actions';
import { notFound } from './errors/routes';
import { isPlainObject } from './guards';
import { addToast } from './notifications/actions';
import {
  ActionHookBody,
  AnyAction,
  AnyActionCreator,
  AppServices,
  AppState,
  Dispatch,
  Middleware
} from './types';

export * from './utils/assertions';
export * from './utils/browser-assertions';

export const checkActionType = <C extends AnyActionCreator>(actionCreator: C) =>
  (action: AnyAction): action is ReturnType<C> => action.type === getType(actionCreator);

export const actionHook = <C extends AnyActionCreator>(actionCreator: C, body: ActionHookBody<C>) =>
  (services: AppServices): Middleware => (stateHelpers) => {
    const boundHook = body({...stateHelpers, ...services});
    const catchError = makeCatchError(stateHelpers.dispatch);
    const matches = checkActionType(actionCreator);

    return (next: Dispatch) => (action: AnyAction) => {
      const result = next(action);

      if (matches(action)) {
        try {
          const promise = boundHook(action);
          if (promise) {
            services.promiseCollector.add(promise.catch(catchError));
          }
        } catch (e) {
          catchError(e);
        }
      }
      return result;
    };
  };

const makeCatchError = (dispatch: Dispatch) => (e: Error) => {
  if (e instanceof UnauthenticatedError) {
    dispatch(receiveLoggedOut());
    return;
  } else if (e instanceof BookNotFoundError) {
    Sentry.captureException(e);
    notFound.redirect();
    return;
  } else if (e instanceof ApplicationMesssageError) {
    Sentry.captureException(e);
    dispatch(addToast(e.messageKey, e.meta));
    return;
  }
  Sentry.captureException(e);
  dispatch(recordError(e));
  dispatch(showErrorDialog());
};

// from https://github.com/facebook/react/issues/13029#issuecomment-445480443
export const mergeRefs = <T>(...refs: Array<Ref<T> | undefined>) => (ref: T) => {
  refs.forEach((resolvableRef) => {
    if (typeof resolvableRef === 'function') {
      resolvableRef(ref);
    } else if (resolvableRef) {
      (resolvableRef as any).current = ref;
    }
  });
};

export const remsToEms = (rems: number) => rems * 10 / 16;

export const remsToPx = (rems: number) => {
  const bodyFontSize = typeof(window) === 'undefined' || !window.document.documentElement
    ? 10
    : parseFloat(window.getComputedStyle(window.document.documentElement).fontSize || '') || 10;

  return rems * bodyFontSize;
};

export const referringHostName = (window: Window) => {
  let hostName = 'unknown';

  if (window.location === window.parent.location) {
    hostName = 'not embedded';
  } else if (window.document.referrer) {
    const {host} = new URL(window.document.referrer);
    hostName = host;
  }
  return hostName;
};

export const getAllRegexMatches = (regex: RegExp) => {
  if (!regex.global) {
    throw new Error('getAllRegexMatches must be used with the global flag');
  }

  return (string: string) => {
    const matches: RegExpExecArray[] = [];
    let match: RegExpExecArray | null;
    while ((match = regex.exec(string)) ) { // tslint:disable-line:no-conditional-assignment
      matches.push(match);
    }
    return matches;
  };
};

export const resetTabIndex = (document: Document) => {
  const index = document.body.tabIndex;
  document.body.tabIndex = 0;

  document.body.focus();
  document.body.tabIndex = index;
};

export const preventDefault = (event: React.MouseEvent) => {
  event.preventDefault();
  return event;
};

export const getCommonProperties = <T1 extends {}, T2 extends {}>(thing1: T1, thing2: T2) =>
  Object.keys(thing1).filter((key) => Object.keys(thing2).includes(key)) as Array<keyof T1 & keyof T2>;

/*
 * recursive merge properties of two inputs. values are merged if they are
 * plain objects or arrays, otherwise if the same property exists in both
 * objects the value from the second argument will win.
 *
 * unlike lodash merge, this will not change object references for values that
 * exist only in one parameter.
 */
export const merge = <T1 extends {}, T2 extends {}>(thing1: T1, thing2: T2): T1 & T2 => ({
  ...thing1,
  ...thing2,
  ...getCommonProperties(thing1, thing2).reduce((result, property) => ({
    ...result,
    ...(isPlainObject(thing1[property]) && isPlainObject(thing2[property])
      ? {[property]: merge(thing1[property], thing2[property])}
      : (Array.isArray(thing1[property]) && Array.isArray(thing2[property]))
        ? {[property]: [...thing1[property] as unknown as [], ...thing2[property] as unknown as []]}
        : {}
    ),
  }), {}),
});

export const shallowEqual = <T extends object>(objA: T, objB: T) => {
  const keysOfA = Object.keys(objA) as Array<keyof T>;
  const keysOfB = Object.keys(objB) as Array<keyof T>;

  if (keysOfA.length !== keysOfB.length) { return false; }

  return keysOfA.every((key) => {
    return objB.hasOwnProperty(key) && objB[key] === objA[key];
  });
};

export const memoizeStateToProps = <T extends object>(fun: (state: AppState) => T) => {
  let prev = {} as T;

  return (state: AppState) => {
    const current = fun(state);

    if (shallowEqual(current, prev)) {
      return prev;
    }
    prev = current;
    return current;
  };
};

export class CustomApplicationError extends Error {
  constructor(message?: string) {
    super(message);
    this.name = 'CustomApplicationError';
  }
}

// tslint:disable-next-line: max-classes-per-file
export class UnauthenticatedError extends CustomApplicationError {}

// tslint:disable-next-line: max-classes-per-file
export class BookNotFoundError extends CustomApplicationError {}
