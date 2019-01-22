import { updateAvailable } from '../app/notifications/actions';
import { Store } from '../app/types';
import { APP_ENV, RELEASE_ID } from '../config';

export type Cancel = () => void;

export const poll = (store: Store, cancel: Cancel) => async() => {
  const release = await fetch('/rex/release.json')
    .then((response) => response.json())
    .catch(() => ({id: RELEASE_ID}))
  ;

  if (release.id !== RELEASE_ID) {
    cancel();
    store.dispatch(updateAvailable());
  }
};

export default (store: Store): () => void => {
  if (APP_ENV !== 'production' || typeof(window) === 'undefined') {
    return () => undefined;
  }

  const document = window.document;
  let interval: ReturnType<typeof setInterval>;
  const visibilityListener = () => document.visibilityState === 'visible'
    ? activateInterval()
    : clearInterval(interval);

  const cancel = () => {
    document.removeEventListener('visibilitychange', visibilityListener);
    clearInterval(interval);
  }
  ;
  const activateInterval = () => interval = setInterval(poll(store, cancel), 60 * 1000);

  activateInterval();
  document.addEventListener('visibilitychange', visibilityListener);

  return cancel;
};
