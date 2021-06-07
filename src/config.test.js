module.exports = {
  RELEASE_ID: 'test',
  CODE_VERSION: 'test',
  DEPLOYED_ENV: 'test',
  REACT_APP_ARCHIVE_URL: '/apps/archive/codeversion',

  FIXTURES: true,

  PORT: process.env.PORT ? parseInt(process.env.PORT, 10) : 62873,
  DEBUG: process.env.PUPPETEER_DEBUG === 'true',
  PUPPETEER_DEBUG: process.env.PUPPETEER_DEBUG === 'true',
  /*
   * 'live' for yarn start (webpack-dev-server)
   * 'built' for yarn server (pre-rendered html with node server)
   */
  SERVER_MODE: process.env.SERVER_MODE || 'live'
};
