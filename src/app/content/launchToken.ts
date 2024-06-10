import {Window} from '@openstax/types/lib.dom';
import { useServices } from "../context/Services";

export const decodeToken = (launchToken: string | undefined) => {
  if (!launchToken || typeof window === 'undefined') return {};

  // https://stackoverflow.com/a/38552302/14809536
  var base64Url = launchToken.split('.')[1];
  var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
  }).join(''));

  const token = JSON.parse(jsonPayload);
  return 'sub' in token ? JSON.parse(token.sub) : {};
};

export const pullToken = (window: Window) => {
  const searchParams = new URLSearchParams(window.location.search);

  const launchToken = searchParams.get('t') ?? undefined;

  if (!launchToken) {
    return undefined;
  }

  searchParams.delete('t');
  const search = searchParams.toString();
  window.history.replaceState({}, window.document.title, window.location.pathname + (search ? `?${search}` : ''));

  return {tokenString: launchToken, tokenData: decodeToken(launchToken)};
}


export const useLaunchToken = () => {
  const {launchToken} = useServices();
  return launchToken?.tokenData ?? {};
};
