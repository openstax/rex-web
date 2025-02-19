import * as Cookies from 'js-cookie';

const acknowledgedKey = 'cookie_notice_acknowledged';

export const doAcceptCookies = () => {
  Cookies.set(acknowledgedKey, 'true', {expires: 365 * 20});
};

export const isAcceptCookiesNeeded = () => {
  return !window?.cookieYesActive && Cookies.get(acknowledgedKey) !== 'true';
};

export const clearAcceptCookies = () => {
  Cookies.remove(acknowledgedKey);
};
