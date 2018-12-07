const path = require('path');
// NOTE: process.env.NODE_ENV is set to `test` by react-scripts
require('./src/env');

const PORT = parseInt(process.env.PORT);

if (Number.isNaN(PORT)) {
  throw new Error(`BUG: PORT is not defined. Add it to .env.${process.env.NODE_ENV}`)
}

module.exports = {
  launch: {
    executablePath: process.env.PUPPETEER_CHROME_PATH,
    defaultViewport: {
      width: 1200,
      height: 400,
    },
    args: [
      // https://github.com/GoogleChrome/puppeteer/issues/2410
      '--font-render-hinting=medium',
    ],
    devtools: process.env.PUPPETEER_DEBUG === 'true',
  },
  server: {
    launchTimeout: 60000,
    // react-scripts start unconditionally sets the NODE_ENV to development,
    // so we're setting CI here even if that isn't necessarily true
    command: process.env.SERVER_MODE === 'built'
      ? `CI=true PORT=${PORT} yarn server`
      : `CI=true PORT=${PORT} BROWSER=none yarn start`,
    port: PORT,
  },
}
