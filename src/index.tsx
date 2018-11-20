import React from 'react';
import ReactDOM from 'react-dom';
import createApp from './app';
import loadFont from './helpers/loadFont';
import './index.css';
import * as serviceWorker from './serviceWorker';

if (typeof(document) === 'undefined' || typeof(window) === 'undefined') {
  throw new Error('Browser entrypoint must be used in the browser');
}

if (window.top === window.self) {
  const devMessage = [
    `Howdy! If you want to help out, the source code can be found at `,
    `https://github.com/openstax/books-web`,
  ];
  console.info(`%c` + devMessage.join(''), 'font-weight:bold'); // tslint:disable-line:no-console
}

const app = createApp();

// bind this to the window so profiling tools can access it
window.__APP_ASYNC_HOOKS = app.services.promiseCollector;

app.services.fontCollector.handle((font) => {
  app.services.promiseCollector.add(loadFont(font));
});

ReactDOM.render(<app.container />, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
