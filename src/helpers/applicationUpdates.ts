import { ServiceWorkerRegistration } from '@openstax/types/lib.dom';
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

  sw.addEventListener('updatefound', function updateHandler() {
    sw.removeEventListener('updatefound', updateHandler);

    const {installing} = sw;
    if (installing) {
      installing.addEventListener('statechange', function installedHandler() {
        if (installing.state === 'installed') {
          installing.removeEventListener('statechange', installedHandler);
          callback();
        }
      });
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
    waiting.addEventListener('statechange', function activatingHandler() {
      if (waiting.state === 'activating') {
        waiting.removeEventListener('statechange', activatingHandler);
        forceReload();
      }
    });
    waiting.postMessage({type:  'SKIP_WAITING'});
  } else {
    forceReload();
  }
};
