import type { HTMLInputElement } from '@openstax/types/lib.dom';
import type { ConsentPreferences, CookieYesBannerLoadEvent, CookieYesConsentUpdateEvent } from 'cookieyes';
import queryString from 'query-string';
import React from 'react';
import ReactDOM from 'react-dom';
import Loadable from 'react-loadable';
import createApp from './app';
import { onPageFocusChange } from './app/domUtils';
import * as selectHead from './app/head/selectors';
import createIntl from './app/messages/createIntl';
import { currentLocale } from './app/messages/selectors';
import { updateAvailable } from './app/notifications/actions';
import { assertDefined, assertWindow } from './app/utils';
import config from './config';
import './content.css';
import createArchiveLoader from './gateways/createArchiveLoader';
import createBookConfigLoader from './gateways/createBookConfigLoader';
import createHighlightClient from './gateways/createHighlightClient';
import createOSWebLoader from './gateways/createOSWebLoader';
import createPracticeQuestionsLoader from './gateways/createPracticeQuestionsLoader';
import createSearchClient from './gateways/createSearchClient';
import createUserLoader from './gateways/createUserLoader';
import createImageCDNUtils from './gateways/createImageCDNUtils';
import { registerGlobalAnalytics } from './helpers/analytics';
import loadFont from './helpers/loadFont';
import { initializeMathJaxMenuPositioning } from './helpers/mathjaxMenuPosition';
import pollUpdates from './helpers/pollUpdates';
import Sentry from './helpers/Sentry';
import './index.css';
import * as serviceWorker from './serviceWorker';
import { pullToken } from './app/content/launchToken';

const window = assertWindow('Browser entrypoint must be used in the browser');
const document = window.document;

if (window.top === window.self) {
  const devMessage = [
    `Howdy! If you want to help out, the source code can be found at `,
    `https://github.com/openstax/rex-web`,
  ];
  console.info(`%c` + devMessage.join(''), 'font-weight:bold'); // eslint-disable-line no-console
}

const osWebUrl = assertDefined(config.REACT_APP_OS_WEB_API_URL, 'REACT_APP_OS_WEB_API_URL must be defined');
const accountsUrl = assertDefined(config.REACT_APP_ACCOUNTS_URL, 'REACT_APP_ACCOUNTS_URL must be defined');
const searchUrl = assertDefined(config.REACT_APP_SEARCH_URL, 'REACT_APP_SEARCH_URL must be defined');
const highlightsUrl = assertDefined(config.REACT_APP_HIGHLIGHTS_URL, 'REACT_APP_HIGHLIGHTS_URL must be defined');
const mainContent = document.getElementById('main-content');

const userLoader = createUserLoader(accountsUrl);

const app = createApp({
  initialState: window.__PRELOADED_STATE__,
  services: {
    archiveLoader: createArchiveLoader(),
    bookConfigLoader: createBookConfigLoader(),
    launchToken: pullToken(window),
    config,
    highlightClient: createHighlightClient(highlightsUrl, userLoader.getAuthorizedFetchConfig),
    osWebLoader: createOSWebLoader(osWebUrl),
    practiceQuestionsLoader: createPracticeQuestionsLoader(),
    prerenderedContent: mainContent ? mainContent.innerHTML : undefined,
    searchClient: createSearchClient(searchUrl),
    userLoader,
    imageCDNUtils: createImageCDNUtils(),
  },
});

// bind this to the window so profiling tools can access it
window.__APP_STORE = app.store;
window.__APP_SERVICES = app.services;
window.__APP_ASYNC_HOOKS = app.services.promiseCollector;

app.services.fontCollector.handle((font) => {
  app.services.promiseCollector.add(loadFont(font));
});

app.services.promiseCollector.calm().then(() => {
  if (typeof(document) !== 'undefined') {
    document.body.setAttribute('data-rex-loaded', 'true');
  }
});

if (window.__PRELOADED_STATE__) {
  // content isn't received in a preloaded state its in the state already,
  // so trigger it here
  window.dataLayer.push({contentTags: selectHead.contentTags(app.store.getState())});

  Loadable.preloadReady()
    .then(() => {
      // during pre-rendering this happens in src/app/content/hooks/intlHook.ts
      // it would be nice to consolodate this logic, but in hydration we don't necessarily
      // want to wait for promiseCollector.calm() before rendering _anything_, so there are some
      // discrepancies in the flow that make the logic annoying.
      const locale = currentLocale(app.store.getState());
      return locale ? createIntl(locale) : null;
    })
    .then((intl) => {
      app.services.intl.current = intl;
      ReactDOM.hydrate(<app.container />, document.getElementById('root'), doneRendering);
    });
} else {
  ReactDOM.render(<app.container />, document.getElementById('root'), doneRendering);
}

function doneRendering() {
  const initialActions = queryString.parse(window.location.search).initialActions;
  if (typeof(initialActions) === 'string') {
    const actions: Parameters<typeof app.store.dispatch>[0][] = JSON.parse(initialActions);
    actions.forEach((action) => app.store.dispatch(action));
  }
}

window.onblur = onPageFocusChange(false, document, app);
window.onfocus = onPageFocusChange(true, document, app);

window.__APP_ANALYTICS = registerGlobalAnalytics(window, app.store);

initializeMathJaxMenuPositioning(window);

// start long running processes
pollUpdates(app.store);

function cookiesBlocked(e: Error) {
  return e instanceof DOMException && ['SecurityError', 'NotSupportedError'].includes(e.name);
}

const sendConsentToAccounts = (consentPreferences: ConsentPreferences) =>
  userLoader.updateUser({ consent_preferences: consentPreferences })
    .then(() => window.location.reload())
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .catch((error: any) => Sentry.captureException(error));

app.services.userLoader.getCurrentUser().then((user) => {
  document.addEventListener('cookieyes_banner_load', (bannerLoadEventData: unknown) => {
    const consentPreferences = user?.consent_preferences;
    const typedEventData = bannerLoadEventData as CookieYesBannerLoadEvent;

    if (consentPreferences) {
      // Accounts remembers some state
      // We always defer to Accounts in this case

      // Only call the CookieYes API if it doesn't match what's in Accounts
      let doUpdate = !typedEventData.detail.isUserActionCompleted;

      consentPreferences.accepted.forEach((accepted) => {
        // There is no "necessary" switch
        if (accepted !== 'necessary') {
          const checkbox = document.getElementById(`ckySwitch${accepted}`) as HTMLInputElement | null;
          if (checkbox) {
            checkbox.checked = true;
            if (!typedEventData.detail.categories[accepted]) { doUpdate = true; }
          }
        }
      });
      consentPreferences.rejected.forEach((rejected) => {
        const checkbox = document.getElementById(`ckySwitch${rejected}`) as HTMLInputElement | null;
        if (checkbox) {
          checkbox.checked = false;
          if (typedEventData.detail.categories[rejected]) { doUpdate = true; }
        }
      });
      if (doUpdate) { performBannerAction('accept_partial'); }
    } else if (typedEventData.detail.isUserActionCompleted) {
      // Accounts doesn't have state but somehow CookieYes does
      // This can happen because of 3rd party cookies enabled, non-embedded launch, etc
      // Ideally we'd clear the CookieYes consent and let users click the banner again,
      // but there's no API to do that
      // So instead we make a request to save the user consent to Accounts
      const currentConsentPreferences: ConsentPreferences = { accepted: [], rejected: [] };
      Object.entries(typedEventData.detail.categories).forEach(([category, accepted]) => {
        const arr = accepted ? currentConsentPreferences.accepted : currentConsentPreferences.rejected;
        arr.push(category);
      });
      if (user) { sendConsentToAccounts(currentConsentPreferences); }
    } else {
      // If we don't have a recorded consent and they click the X button, interpret it as "reject all"
      document.getElementsByClassName('cky-banner-btn-close')[0]?.addEventListener(
        'click', () => performBannerAction('reject')
      );
    }

    document.addEventListener('cookieyes_consent_update', (consentUpdateEventData: unknown) => {
      if (user) { sendConsentToAccounts((consentUpdateEventData as CookieYesConsentUpdateEvent).detail); }
    });

    window.cookieYesActive = true;
  });

  async function shouldSkipGTM() {
    const pathMatch = window.location.pathname.match(/\/portal\/([^/]+)/);
    if (pathMatch) {
      const portalName = pathMatch[1];
      try {
        const schoolData = await app.services.osWebLoader.getSchoolDataFromPortalName(portalName);
        if (schoolData?.industry === 'K12') {
          return true;
        }
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('Error fetching school data', e);
      }
    }
    return false;
  }

  (async() => {
    const skipGTM = await shouldSkipGTM();
    if (!skipGTM) {
      /* eslint-disable no-var, @typescript-eslint/no-non-null-assertion */
      // GTM snippet slightly modified to assume f.parentNode is not null and with const types so ts doesn't complain
      (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
        new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
        j=d.createElement(s),dl=l!=='dataLayer'?'&l='+l:'';j.async=true;j.src=
        'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode!.insertBefore(j,f);
        })(window,document,'script' as const,'dataLayer' as const,'GTM-TFCS56G');
    }
  })();

  /* eslint-enable no-var, @typescript-eslint/no-non-null-assertion */

  // The code below similar logic to the GTM script but to insert the CookieYes script instead
  // Both scripts are async so they run in an unpredictable order and the position on the page does not matter
  const cookieYesScript = document.createElement('script');
  cookieYesScript.async = true;
  cookieYesScript.src = 'https://cdn-cookieyes.com/client_data/7c03144a7ef8b7f646f1ce01/script.js';
  const firstScriptTag = document.getElementsByTagName('script')[0];
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  firstScriptTag.parentNode!.insertBefore(cookieYesScript, firstScriptTag);
});

// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.register()
  .then((registration) => {
    if (!window.navigator.serviceWorker.controller) {
      return;
    }

    if (registration && (registration.waiting || registration.installing)) {
      app.store.dispatch(updateAvailable());
    } else if (registration) {
      // For Chrome and Edge registration.waiting and registration.installing
      // is still null for some time after .register()
      registration.addEventListener('updatefound', () => {
        app.store.dispatch(updateAvailable());
      });
    }
  })
  .catch((e) => {
    if (e instanceof Error && !cookiesBlocked(e)) {
      Sentry.captureException(e);
    }
  });
