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
      '--disable-dev-shm-usage',
    ],
  },
  server: {
    command: `yarn server ${SERVER_PORT}`,
    port: SERVER_PORT,
  },
}
