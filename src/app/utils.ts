import React, { Ref } from 'react';
import { getType } from 'typesafe-actions';
import { ApplicationError, ToastMesssageError } from '../helpers/applicationMessageError';
import Sentry from '../helpers/Sentry';
import { receiveLoggedOut } from './auth/actions';
import { recordError, showErrorDialog } from './errors/actions';
import { notFound } from './errors/routes';
import { replace } from './navigation/actions';
import * as selectNavigation from './navigation/selectors';
import { addToast } from './notifications/actions';
import {
  ActionHookBody,
  AnyAction,
  AnyActionCreator,
  AppServices,
  AppState,
  Dispatch,
  Middleware,
  MiddlewareAPI
} from './types';
export { merge, getCommonProperties } from '@openstax/ts-utils';
export * from './utils/assertions';
export * from './utils/browser-assertions';

export const checkActionType = <C extends AnyActionCreator>(actionCreator: C) =>
  (action: AnyAction): action is ReturnType<C> => action.type === getType(actionCreator);

export const actionHook = <C extends AnyActionCreator>(actionCreator: C, body: ActionHookBody<C>) =>
  (services: AppServices): Middleware => (stateHelpers) => {
    const boundHook = body({...stateHelpers, ...services});
    const catchError = makeCatchError(stateHelpers);
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
          catchError(e as Error);
        }
      }
      return result;
    };
  };

const makeCatchError = ({dispatch, getState}: MiddlewareAPI) => (e: Error) => {
  if (e instanceof UnauthenticatedError) {
    dispatch(receiveLoggedOut());
    return;
  } else if (e instanceof BookNotFoundError) {
    Sentry.captureException(e);
    dispatch(replace({route: notFound, params: {url: selectNavigation.pathname(getState())}, state: {}}));
    return;
  } else if (e instanceof ArchiveBookMissingError) {
    // Most of the app intentionally doesn't render until book data is loaded,
    // so allow this error to bubble up and let the outer ErrorBoundary handle it.
    throw e;
  } else if (e instanceof ToastMesssageError) {
    const errorId = Sentry.captureException(e);
    dispatch(addToast(e.messageKey, { ...e.meta, errorId }));
    return;
  }
  Sentry.captureException(e);
  dispatch(recordError(e));
  dispatch(showErrorDialog());
};

export const isNetworkError = (error: unknown) => {
  return error instanceof TypeError && error.message.includes('Failed to fetch');
};

// from https://github.com/facebook/react/issues/13029#issuecomment-445480443
export const mergeRefs = <T>(...refs: Array<Ref<T> | undefined>) => (ref: T) => {
  refs.forEach((resolvableRef) => {
    if (typeof resolvableRef === 'function') {
      resolvableRef(ref);
    } else if (resolvableRef) {
      (resolvableRef as React.MutableRefObject<T>).current = ref;
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
    while ((match = regex.exec(string)) ) {
      matches.push(match);
    }
    return matches;
  };
};

export const preventDefault = (event: React.MouseEvent) => {
  event.preventDefault();
  return event;
};

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

export const stripHtml = (html: string, trimResult = false) => {
  const domParser = new DOMParser();
  const doc = domParser.parseFromString(html, 'text/html');
  const text = doc.body.textContent || '';
  return trimResult ? text.replace(/\s+/g, ' ').trim() : text;
};

export const tuple = <A extends unknown[]>(...args: A) => args;

export class UnauthenticatedError extends ApplicationError {}

export class BookNotFoundError extends ApplicationError {}

export class ArchiveBookMissingError extends ApplicationError {}
