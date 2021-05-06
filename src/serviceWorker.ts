// This optional code is used to register a service worker.
// register() is not called by default.

// This lets the app load faster on subsequent visits in production, and gives
// it offline capabilities. However, it also means that developers (and users)
// will only see deployed updates on subsequent visits to a page, after all the
// existing tabs open on the page have been closed, since previously cached
// resources are updated in the background.

// To learn more about the benefits of this model and instructions on how to
// opt-in, read https://bit.ly/CRA-PWA

import { ServiceWorkerRegistration } from '@openstax/types/lib.dom';
import { assertWindow } from './app/utils';
import Sentry, { Severity } from './helpers/Sentry';
// tslint:disable:no-console

const window = assertWindow();
const navigator = window.navigator;

const isLocalhost = Boolean(
  window.location.hostname === 'localhost' ||
    // [::1] is the IPv6 localhost address.
    window.location.hostname === '[::1]' ||
    // 127.0.0.0/8 are considered localhost for IPv4.
    window.location.hostname.match(
      /^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/
    )
);

export function register(): Promise<ServiceWorkerRegistration> {
  if (!('serviceWorker' in navigator)) {
    Sentry.captureException(new Error('Service worker not supported'), Severity.Warning);
    return Promise.reject();
  }
  if (process.env.NODE_ENV !== 'production') {
    Sentry.captureException(new Error('Service worker disabled outside production'), Severity.Info);
    return Promise.reject();
  }
  if (process.env.REACT_APP_ENV === 'test') {
    Sentry.captureException(new Error('service worker disabled in testing'), Severity.Info);
    return Promise.reject();
  }

  // The URL constructor is available in all browsers that support SW.
  const publicUrl = new URL(
    // PUBLIC_URL is not set up for rex-web envs.
    process.env.PUBLIC_URL || '',
    window.location.href
  );
  if (publicUrl.origin !== window.location.origin) {
    // Our service worker won't work if PUBLIC_URL is on a different origin
    // from what our page is served on. This might happen if a CDN is used to
    // serve assets; see https://github.com/facebook/create-react-app/issues/2374
    return Promise.reject(
      new Error('service worker won\'t work if PUBLIC_URL is on a different origin from what our page is served on.')
    );
  }

  return new Promise((resolve, reject) => {
    window.addEventListener('load', () => {
      const swUrl = `/books/service-worker.js`;

      if (isLocalhost) {
        // This is running on localhost. Let's check if a service worker still exists or not.
        checkValidServiceWorker(swUrl)
          .then(resolve, reject)
        ;

        // Add some additional logging to localhost, pointing developers to the
        // service worker/PWA documentation.
        navigator.serviceWorker.ready.then(() => {
          console.log(
            'This web app is being served cache-first by a service ' +
              'worker. To learn more, visit https://bit.ly/CRA-PWA'
          );
        });
      } else {
        // Is not localhost. Just register service worker
        registerValidSW(swUrl)
          .then(resolve, reject)
        ;
      }
    });
  });
}

function registerValidSW(swUrl: string): Promise<ServiceWorkerRegistration> {
  return navigator.serviceWorker
    .register(swUrl)
    .catch((error) => {
      console.error('Error during service worker registration:', error);
      return Promise.reject(error);
    });
}

function checkValidServiceWorker(swUrl: string): Promise<ServiceWorkerRegistration> {
  // Check if the service worker can be found. If it can't reload the page.
  return fetch(swUrl, {
    headers: { 'Service-Worker': 'script' },
  })
    .then((response) => {
      // Ensure service worker exists, and that we really are getting a JS file.
      const contentType = response.headers.get('content-type');
      if (
        response.status === 404 ||
        (contentType != null && contentType.indexOf('javascript') === -1)
      ) {
        // No service worker found. Probably a different app. Reload the page.
        navigator.serviceWorker.ready.then((registration) => {
          registration.unregister().then(() => {
            window.location.reload();
          });
        });

        return Promise.reject(new Error('No service worker found. Probably a different app. Reload the page.'));
      } else {
        // Service worker found. Proceed as normal.
        return registerValidSW(swUrl);
      }
    })
    .catch(() => {
      console.log(
        'No internet connection found. App is running in offline mode.'
      );

      return Promise.reject(new Error('No internet connection found. App is running in offline mode.'));
    });
}

export function unregister() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then((registration) => {
      registration.unregister();
    });
  }
}
