import { receiveLoggedOut } from '../../auth/actions';
import { locationChange } from '../../navigation/actions';
import theme from '../../theme';
import { ActionHookBody } from '../../types';
import { actionHook, assertWindow } from '../../utils';
import { closeCallToActionPopup, openCallToActionPopup } from '../actions';
import { showCTAPopup } from '../selectors';

const pageLoadedAt = new Date().getTime();
const showPopupAfter = 5000;

export const receiveLoggedOutHookBody: ActionHookBody<typeof receiveLoggedOut> =
  ({analytics, getState, dispatch}) => async() => {
    const state = getState();
    const showCTA = showCTAPopup(state);
    const trackShow = analytics.signupCTA.bind(state);

    if (showCTA === null && !assertWindow().matchMedia(theme.breakpoints.mobileQuery).matches) {
      const now = new Date().getTime();
      const timeFromPageLoaded = now - pageLoadedAt;
      setTimeout(() => {
        trackShow('open');
        dispatch(openCallToActionPopup());
      }, Math.max(showPopupAfter - timeFromPageLoaded, 0));
    }
  };

export const locationChangeHookBody: ActionHookBody<typeof locationChange> =
  ({analytics, getState, dispatch}) => async() => {
    const state = getState();
    const showCTA = showCTAPopup(state);
    const trackClose = analytics.signupCTA.bind(state);

    if (showCTA === true) {
      trackClose('close by navigating');
      dispatch(closeCallToActionPopup());
    }
  };

export const showCTAPopupHook = actionHook(receiveLoggedOut, receiveLoggedOutHookBody);
export const closeCTAPopupHook = actionHook(locationChange, locationChangeHookBody);
