import queryString from 'query-string';
import React from 'react';
import ReactDOM from 'react-dom';
import Loadable from 'react-loadable';
import createApp from './app';
import { assertWindowDefined } from './app/utils';
import config from './config';
import createArchiveLoader from './helpers/createArchiveLoader';
import createOSWebLoader from './helpers/createOSWebLoader';
import loadFont from './helpers/loadFont';
import { startMathJax } from './helpers/mathjax';
import pollUpdates from './helpers/pollUpdates';
import './index.css';
import * as serviceWorker from './serviceWorker';

const window = assertWindowDefined('Browser entrypoint must be used in the browser');
const document = window.document;

if (window.top === window.self) {
  const devMessage = [
    `Howdy! If you want to help out, the source code can be found at `,
    `https://github.com/openstax/rex-web`,
  ];
  console.info(`%c` + devMessage.join(''), 'font-weight:bold'); // tslint:disable-line:no-console
}

if (!config.REACT_APP_ARCHIVE_URL) { throw new Error('REACT_APP_ARCHIVE_URL must be defined'); }
if (!config.REACT_APP_OS_WEB_API_URL) { throw new Error('REACT_APP_OS_WEB_API_URL must be defined'); }

const app = createApp({
  initialState: window.__PRELOADED_STATE__,
  services: {
    archiveLoader: createArchiveLoader(config.REACT_APP_ARCHIVE_URL),
    osWebLoader: createOSWebLoader(config.REACT_APP_OS_WEB_API_URL),
  },
});

// bind this to the window so profiling tools can access it
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
  Loadable.preloadReady().then(() => {
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

// start long running processes
pollUpdates(app.store);
startMathJax();

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
