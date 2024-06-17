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
  return 'sub' in token ? JSON.parse(token.sub) : undefined;
};

export const pullToken = (window: Window) => {
  const searchParams = new URLSearchParams(window.location.search);

  const launchToken = searchParams.get('t') ?? undefined;

  if (!launchToken) {
    return undefined;
  }
  
  const tokenData = decodeToken(launchToken);
  const contextId = typeof tokenData.contextId === 'string' ? tokenData.contextId : undefined;
  const resourceId = typeof tokenData.resourceId === 'string' ? tokenData.resourceId : undefined;
  const pathPrefix = contextId && resourceId && window.location.pathname.startsWith('/books')
    ? `/apps/rex/course/${contextId}/resources/${resourceId}`
    : '';

  searchParams.delete('t');
  const search = searchParams.toString();
  window.history.replaceState({}, window.document.title, pathPrefix + window.location.pathname + (search ? `?${search}` : ''));

  if (!tokenData) {
    return undefined;
  }

  return {tokenString: launchToken, tokenData};
};


export const useLaunchToken = () => {
  const {launchToken} = useServices();
  return launchToken?.tokenData ?? {};
};
