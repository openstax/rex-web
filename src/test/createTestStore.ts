import { createMemoryHistory } from 'history';
import cloneDeep from 'lodash/fp/cloneDeep';
import { combineReducers, createStore } from 'redux';
import auth, {initialState as authState } from '../app/auth/reducer';
import content, {initialState as contentState } from '../app/content/reducer';
import errors, {initialState as errorState } from '../app/errors/reducer';
import featureFlags, {initialState as featureFlagState } from '../app/featureFlags/reducer';
import head, { initialState as headState } from '../app/head/reducer';
import createNavigationReducer from '../app/navigation/reducer';
import notifications, {initialState as notificationState } from '../app/notifications/reducer';
import { AnyAction, AppState } from '../app/types';

export default function(initialState: Partial<AppState> = {}) {
  const history = createMemoryHistory();
  const navigation = createNavigationReducer(history.location);

  const reducer = combineReducers<AppState, AnyAction>({
    auth,
    content,
    errors,
    featureFlags,
    head,
    navigation,
    notifications,
  });

  return createStore(reducer, cloneDeep({
    auth: authState,
    content: contentState,
    errors: errorState,
    featureFlags: featureFlagState,
    head: headState,
    notifications: notificationState,
    ...initialState,
  }));
}
