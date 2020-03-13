const query = require('query-string');

const REACT_APP_ARCHIVE_URL = typeof(window) === 'undefined'
  ? undefined
  : query.parse(window.location.search).archive
;

const UNLIMITED_CONTENT_OVERRIDE = typeof(window) === 'undefined'
  ? undefined
  : query.parse(window.location.search).validateLinks !== undefined
;

const UNLIMITED_CONTENT = UNLIMITED_CONTENT_OVERRIDE === undefined
  ? process.env.REACT_APP_UNLIMITED_CONTENT
  : UNLIMITED_CONTENT
;

module.exports = {
  RELEASE_ID: 'development',
  CODE_VERSION: 'development',
  DEPLOYED_ENV: 'development',

  REACT_APP_ARCHIVE_URL: REACT_APP_ARCHIVE_URL || '',

  ACCOUNTS_URL: process.env.ACCOUNTS_URL || 'https://accounts-dev.openstax.org',
  OS_WEB_URL: process.env.OS_WEB_URL || 'https://cms-dev.openstax.org',
  HIGHLIGHTS_URL: 'https://highlights-feb24pl.sandbox.openstax.org',

  SKIP_OS_WEB_PROXY: process.env.SKIP_OS_WEB_PROXY !== undefined,
  FIXTURES: false,
  DEBUG: true,

  BOOKS: require('./config.books'),

  PORT: process.env.PORT ? parseInt(process.env.PORT, 10) : 8000,

  UNLIMITED_CONTENT: UNLIMITED_CONTENT === undefined ? true : UNLIMITED_CONTENT
};
