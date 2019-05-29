/*
 * This file is written in JS so the unused configs are optimized out of the built file.
 *
 * `react-scripts start` hardcodes NODE_ENV='development' but we run it in
 * testing for browser tests.
 *
 * `react-scripts build` hardcodes NODE_ENV='production' but we run it in
 * testing for prerender tests.
 *
 * because of this react-scripts NODE_ENV kerfuffle, we ignore it and use
 * REACT_APP_ENV instead. because we ignore NODE_ENV, we cannot rely on
 * the dotenv files that react-scripts loads automatically. instead we use
 * these javascript config files for committed configurations.
 */

let config = {
  APP_ENV: process.env.REACT_APP_ENV,
  ACCOUNTS_URL: process.env.ACCOUNTS_URL || 'https://accounts.openstax.org',
  ARCHIVE_URL: process.env.ARCHIVE_URL || 'https://archive.cnx.org',
  OS_WEB_URL: process.env.OS_WEB_URL || 'https://openstax.org',
  SEARCH_URL: process.env.SEARCH_SWAGGER || 'https://openstax.org',
  REACT_APP_ACCOUNTS_URL: '/accounts',
  REACT_APP_ARCHIVE_URL: '/contents',
  REACT_APP_OS_WEB_API_URL: '/api/v2/pages',
  REACT_APP_SEARCH_URL: '/open-search/api/v0',
};

if (process.env.REACT_APP_ENV === 'production') {
  Object.assign(config, require('./config.production.js'));
} else if (process.env.REACT_APP_ENV === 'test') {
  Object.assign(config, require('./config.test.js'));
} else {
  Object.assign(config, require('./config.development.js'));
}

module.exports = config;
