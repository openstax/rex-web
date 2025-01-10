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
import loadOptimize from './helpers/loadOptimize';
import { startMathJax } from './helpers/mathjax';
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
  console.info(`%c` + devMessage.join(''), 'font-weight:bold'); // tslint:disable-line:no-console
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

// GTM snippet slightly modified to assume f.parentNode is not null and with const types so ts doesn't complain
(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode!.insertBefore(j,f);
})(window,document,'script' as const,'dataLayer' as const,'GTM-TFCS56G');

window.dataLayer = window.dataLayer || [];
function gtag(..._args: any[]) { window.dataLayer.push(arguments); }
gtag('consent', 'default', {
  ad_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied',
  analytics_storage: 'denied',
  functionality_storage: 'denied',
  personalization_storage: 'denied',
  security_storage: 'granted',
  wait_for_update: 2000,
});
gtag('set', 'ads_data_redaction', true);
gtag('set', 'url_passthrough', false);
gtag('js', new Date());

window.dataLayer.push({app: 'rex'});

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
    const actions = JSON.parse(initialActions);
    actions.forEach((action: any) => app.store.dispatch(action));
  }
}

window.onblur = onPageFocusChange(false, document, app);
window.onfocus = onPageFocusChange(true, document, app);

window.__APP_ANALYTICS = registerGlobalAnalytics(window, app.store);

// start long running processes
pollUpdates(app.store);
startMathJax();

// load optimize
loadOptimize(window, app.store);

function cookiesBlocked(e: Error) {
  return e instanceof DOMException && ['SecurityError', 'NotSupportedError'].includes(e.name);
}

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
