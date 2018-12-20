const path = require('path');
const config = require('./src/config');
const {PORT, PUPPETEER_DEBUG, SERVER_MODE} = config;

module.exports = {
  launch: {
    defaultViewport: {
      width: 1200,
      height: 400,
    },
    args: [
      // https://github.com/GoogleChrome/puppeteer/issues/2410
      '--font-render-hinting=medium',
    ],
    devtools: PUPPETEER_DEBUG,
  },
  server: {
    launchTimeout: 60000,
    // react-scripts start unconditionally sets the NODE_ENV to development,
    // so we're setting REACT_APP_ENV here to work around.
    command: SERVER_MODE === 'built'
      ? `NODE_ENV=test PORT=${PORT} yarn server`
      : `REACT_APP_ENV=test PORT=${PORT} BROWSER=none yarn start`,
    port: PORT,
  },
}
