import { receiveLoggedOut } from '../../auth/actions';
import { locationChange } from '../../navigation/actions';
import theme from '../../theme';
import { ActionHookBody } from '../../types';
import { actionHook, assertWindow } from '../../utils';
import { closeCallToActionPopup, openCallToActionPopup } from '../actions';
import { showCTAPopup } from '../selectors';

const pageLoadedAt = new Date().getTime();
const showPopupAfter = 5000;

export const receiveLoggedOutHookBody: ActionHookBody<typeof receiveLoggedOut> = (services) => async() => {
  const state = services.getState();
  const showCTA = showCTAPopup(state);
  const eventData = services.analytics.signupCTA.selector(state);

  if (showCTA === null && !assertWindow().matchMedia(theme.breakpoints.mobileQuery).matches) {
    const now = new Date().getTime();
    const timeFromPageLoaded = now - pageLoadedAt;
    setTimeout(() => {
      services.analytics.signupCTA.track(eventData, true);
      services.dispatch(openCallToActionPopup());
    }, Math.max(showPopupAfter - timeFromPageLoaded, 0));
  }
};

export const locationChangeHookBody: ActionHookBody<typeof locationChange> = (services) => async() => {
  const state = services.getState();
  const showCTA = showCTAPopup(state);
  const eventData = services.analytics.signupCTA.selector(state);

  if (showCTA === true) {
    services.analytics.signupCTA.track(eventData, false);
    services.dispatch(closeCallToActionPopup());
  }
};

export const showCTAPopupHook = actionHook(receiveLoggedOut, receiveLoggedOutHookBody);
export const closeCTAPopupHook = actionHook(locationChange, locationChangeHookBody);
