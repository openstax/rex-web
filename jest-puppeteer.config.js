const path = require('path');
// NOTE: process.env.NODE_ENV is set to `test` by react-scripts
require('./src/env');

const SERVER_PORT = parseInt(process.env.SERVER_PORT);

if (Number.isNaN(SERVER_PORT)) {
  throw new Error(`BUG: SERVER_PORT is not defined. Add it to .env.${process.env.NODE_ENV}`)
}

module.exports = {
  launch: {
    executablePath: process.env.PUPPETEER_CHROME_PATH,
    args: [
      // https://github.com/GoogleChrome/puppeteer/issues/2410
      '--font-render-hinting=medium',

      // https://github.com/GoogleChrome/puppeteer/issues/3120#issuecomment-415553869
      '--disable-gpu',
      '--disable-dev-shm-usage',
      '--disable-setuid-sandbox',
      '--no-first-run',
      '--no-sandbox',
      '--no-zygote',
      '--single-process',
    ],
  },
  server: {
    launchTimeout: 60000,
    // react-scripts start unconditionally sets the NODE_ENV to development,
    // so we're setting CI here even if that isn't necessarily true
    command: `CI=true PORT=${SERVER_PORT} BROWSER=none yarn run start`,
    port: SERVER_PORT,
  },
}
