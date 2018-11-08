import React from 'react';
import ReactDOM from 'react-dom';
import createApp from './app';
import './index.css';
import * as serviceWorker from './serviceWorker';

if (typeof(document) === 'undefined') {
  throw new Error('Browser entrypoint must be used in the browser');
}

if (window && window.top === window.self) {
  const devMessage = `Howdy! If you want to help out, the source code can be found at https://github.com/openstax/books-web`;
  console.info(`%c` + devMessage, 'font-weight:bold'); // tslint:disable-line:no-console
}

const app = createApp();

ReactDOM.render(<app.container />, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
