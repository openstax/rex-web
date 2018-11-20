const path = require('path');
const dotenv = require('dotenv');

dotenv.config({path: path.join(__dirname, '.env.development')});

const SERVER_PORT = parseInt(process.env.SERVER_PORT);

if (Number.isNaN(SERVER_PORT)) {
  throw new Error(`BUG: SERVER_PORT is not defined. Add it to .env.development`)
}

module.exports = {
  launch: {
    executablePath: process.env.PUPPETEER_CHROME_PATH,
    args: [
      // https://github.com/GoogleChrome/puppeteer/issues/2410
      '--font-render-hinting=medium',
    ],
  },
  server: {
    command: `yarn run server ${SERVER_PORT}`, // This takes longer & times out: `PORT=${SERVER_PORT} BROWSER=none yarn start`
    port: SERVER_PORT,
    launchTimeout: 30000,
  },
}
