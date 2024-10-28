import { Window } from '@openstax/types/lib.dom';
import { useServices } from '../context/Services';

export const decodeToken = (launchToken: string | undefined) => {
  if (!launchToken || typeof window === 'undefined') return undefined;

  // https://stackoverflow.com/a/38552302/14809536
  const base64Url = launchToken.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(window.atob(base64).split('').map((c) => {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
  }).join(''));

  const token = JSON.parse(jsonPayload);

  try {
    // transitioning launch token parameters out of json encoded sub claim
    // and into their own claims of the token. during transition try to decode
    // sub and apply it to the token data so it works either way.
    Object.assign(token, JSON.parse(token.sub));
  } catch (e) { } // tslint:disable-line

  return token;
};

export const pullToken = (window: Window) => {
  const searchParams = new URLSearchParams(window.location.search);

  const launchToken = searchParams.get('t');

  if (!launchToken) {
    return undefined;
  }

  searchParams.delete('t');
  const search = searchParams.toString();
  window.history.replaceState({}, window.document.title, window.location.pathname + (search ? `?${search}` : ''));

  const tokenData = decodeToken(launchToken);

  if (!tokenData) {
    return undefined;
  }

  return {tokenString: launchToken, tokenData};
};


export const useLaunchToken = () => {
  const {launchToken} = useServices();
  return launchToken?.tokenData ?? {};
};
