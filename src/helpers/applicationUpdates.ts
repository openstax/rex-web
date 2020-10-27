import { ServiceWorker, ServiceWorkerRegistration } from '@openstax/types/lib.dom';
import { assertWindow } from '../app/utils';
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

export const whenState = (sw: ServiceWorker, state: string, callback: () => void) => {
  sw.addEventListener('statechange', function handler() {
    if (sw.state === state) {
      sw.removeEventListener('statechange', handler);
      callback();
    }
  });
};

export const findAndInstallServiceWorkerUpdate = (sw: ServiceWorkerRegistration | undefined, callback: () => void) => {
  if (sw && sw.installing) {
    whenState(sw.installing, 'installed', callback);
    return;
  }

  if (!serviceWorkerNeedsUpdate(sw)) {
    callback();
    return;
  }

  sw.update()
    .then(() => {
      const {installing} = sw;
      if (installing) {
        whenState(installing, 'installed', callback);
      } else {
        callback();
      }
    })
    .catch((e) => {
      Sentry.captureException(e);
      callback();
    })
  ;
};

export const forceReload = () => {
  assertWindow().location.reload(true);
};

export const activateSwAndReload = (sw: ServiceWorkerRegistration | undefined) => () => {
  const {waiting} = sw || {waiting:  undefined};

  if (waiting) {
    whenState(waiting, 'activating', forceReload);
    waiting.postMessage({type:  'SKIP_WAITING'});
  } else {
    forceReload();
  }
};
