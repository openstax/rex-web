import { ServiceWorker, ServiceWorkerRegistration } from '@openstax/types/lib.dom';
import { assertWindow } from '../app/utils';
import Sentry from './Sentry';

export const serviceWorkerNeedsUpdate = (
  sw: ServiceWorkerRegistration | undefined
): sw is ServiceWorkerRegistration => {
  console.log('serviceWorkerNeedsUpdate')
  // if there is no service worker, don't try to update it
  if (!sw) {
    console.log('serviceWorkerNeedsUpdate', 1)
    return false;
  }
  // if there is already a waiting or installing service worker, don't try to udpate it.
  // it'll still be activated by activateSwAndReload
  if (sw.waiting || sw.installing) {
    console.log('serviceWorkerNeedsUpdate', 2)
    return false;
  }

  console.log('serviceWorkerNeedsUpdate', 3)
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
  console.log('findAndInstallServiceWorkerUpdate')
  if (sw && sw.installing) {
    console.log('findAndInstallServiceWorkerUpdate', 1)
    whenState(sw.installing, 'installed', callback);
    return;
  }

  if (!serviceWorkerNeedsUpdate(sw)) {
    console.log('findAndInstallServiceWorkerUpdate', 2)
    callback();
    return;
  }

  sw.update()
    .then(() => {
      console.log('findAndInstallServiceWorkerUpdate', 3)
      const {installing} = sw;
      if (installing) {
        console.log('findAndInstallServiceWorkerUpdate', 4)
        whenState(installing, 'installed', callback);
      } else {
        console.log('findAndInstallServiceWorkerUpdate', 5)
        callback();
      }
    })
    .catch((e) => {
      console.log('findAndInstallServiceWorkerUpdate', 6)
      Sentry.captureException(e);
      callback();
    })
  ;
};

export const forceReload = () => {
  assertWindow().location.reload(true);
};

export const activateSwAndReload = (sw: ServiceWorkerRegistration | undefined) => () => {
  console.log('activateSwAndReload')
  const {waiting} = sw || {waiting:  undefined};

  if (waiting) {
    console.log('activateSwAndReload', 1)
    whenState(waiting, 'activating', forceReload);
    waiting.postMessage({type:  'SKIP_WAITING'});
  } else {
    console.log('activateSwAndReload', 2)
    forceReload();
  }
};
