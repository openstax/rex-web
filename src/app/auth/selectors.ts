import { createSelector } from 'reselect';
import * as selectNavigation from '../navigation/selectors';
import * as parentSelectors from '../selectors';

export const localState = createSelector(
  parentSelectors.localState,
  (parentState) => parentState.auth
);

export const user = createSelector(
  localState,
  (state) => state.user
);

export const isConfirmedFaculty = createSelector(
  localState,
  (state) => state.user?.faculty_status === 'confirmed_faculty'
);

export const loggedOut = createSelector(
  localState,
  user,
  (state, currentUser) => state.established && !currentUser
);

export const loginLink = createSelector(
  selectNavigation.pathname,
  (currentPath) => '/accounts/login?r=' + currentPath
);

export const signupLink = createSelector(
  selectNavigation.pathname,
  (currentPath) => '/accounts/signup?r=' + currentPath
);
