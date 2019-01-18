import { updateAvailable } from '../app/notifications/actions';
import { Store } from '../app/types';
import { APP_ENV, RELEASE_ID } from '../config';

export default (store: Store): () => void => {
  if (APP_ENV !== 'production' || typeof(window) === 'undefined') {
    return () => undefined;
  }

  const document = window.document;
  let interval: ReturnType<typeof setInterval>;
  const activateInterval = () => interval = setInterval(poll, 60 * 1000);
  const visibilityListener = () => document.visibilityState === 'visible'
    ? activateInterval()
    : clearInterval(interval);

  document.addEventListener('visibilitychange', visibilityListener);

  const cancel = () => {
    document.removeEventListener('visibilitychange', visibilityListener);
    clearInterval(interval);
  };

  async function poll() {
    const release = await fetch('/rex/release.json')
      .then((response) => response.json());

    if (release.id !== RELEASE_ID) {
      cancel();
      store.dispatch(updateAvailable());
    }
  }

  activateInterval();

  return cancel;
};
