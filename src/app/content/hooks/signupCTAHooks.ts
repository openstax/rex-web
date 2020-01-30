import { receiveLoggedOut } from '../../auth/actions';
import { RouteHookBody } from '../../navigation/types';
import { routeHook } from '../../navigation/utils';
import theme from '../../theme';
import { ActionHookBody } from '../../types';
import { actionHook, assertWindow } from '../../utils';
import { closeCallToActionPopup, openCallToActionPopup } from '../actions';
import { content } from '../routes';
import { showCTAPopup } from '../selectors';

export const receiveLoggedOutHookBody: ActionHookBody<typeof receiveLoggedOut> = (services) => async() => {
  const state = services.getState();
  const showCTA = showCTAPopup(state);
  const eventData = services.analytics.signupCTA.selector(state);

  if (showCTA === null && !assertWindow().matchMedia(theme.breakpoints.mobileQuery).matches) {
    setTimeout(() => {
      services.analytics.signupCTA.track(eventData, true);
      services.dispatch(openCallToActionPopup());
    }, 5000);
  }
};

export const locationChangeHookBody: RouteHookBody<typeof content> = (services) => async() => {
  const state = services.getState();
  const showCTA = showCTAPopup(state);
  const eventData = services.analytics.signupCTA.selector(state);

  if (showCTA === true) {
    services.analytics.signupCTA.track(eventData, false);
    services.dispatch(closeCallToActionPopup());
  }
};

export const showCTAPopupHook = actionHook(receiveLoggedOut, receiveLoggedOutHookBody);
export const closeCTAPopupHook = routeHook(content, locationChangeHookBody);
