import { ServiceWorkerRegistration } from '@openstax/types/lib.dom';
import { handleEventOnce } from '../app/domUtils';
import Sentry from './Sentry';

export const serviceWorkerNeedsUpdate = (
  sw: ServiceWorkerRegistration | undefined
): sw is ServiceWorkerRegistration => {
  // if there is no service worker, don't try to update it
  if (!sw) {
    return false;
  }
  // if there is already a waiting or installing service worker, don't try to udpate it.
  // it'll still be activated by activateSwAndReload
  if (sw.waiting || sw.installing) {
    return false;
  }

  return true;
};

export const findAndInstallServiceWorkerUpdate = (sw: ServiceWorkerRegistration | undefined, callback: () => void) => {
  if (!serviceWorkerNeedsUpdate(sw)) {
    callback();
    return;
  }
  handleEventOnce(sw, 'updatefound', () => {
    const {installing} = sw;
    if (installing) {
      handleEventOnce(installing, 'statechange', callback, () => installing.state === 'installed');
    } else {
      callback();
    }
  });

  sw.update()
    .then(() => {
      console.log('does this work?', sw.installing);
    })
    .catch((e) => {
      Sentry.captureException(e);
      callback();
    })
  ;
};

export const forceReload = () => {
  if (typeof(window) !== 'undefined') {
    window.location.reload(true);
  }
};

export const activateSwAndReload = (sw: ServiceWorkerRegistration | undefined) => () => {
  const {waiting} = sw || {waiting:  undefined};

  if (waiting) {
    handleEventOnce(waiting, 'statechange', forceReload, () => waiting.state === 'activating');
    waiting.postMessage({type:  'SKIP_WAITING'});
  } else {
    forceReload();
  }
};
