const query = require('query-string');

if (!process.env.REACT_APP_RELEASE_ID) {
  throw new Error('REACT_APP_RELEASE_ID environment variable must be defined in production.');
}
if (!process.env.REACT_APP_CODE_VERSION) {
  throw new Error('REACT_APP_CODE_VERSION environment variable must be defined in production.');
}

// NOTE: for a specific archive version, prefer using the path param. use
// this argument to use a completely different archive, such as archive-preview
// or localhost
//
// only allow using an archive override when not in the service worker context
const REACT_APP_ARCHIVE_URL_OVERRIDE = typeof(window) === 'undefined' || window.location.pathname.startsWith('/books/')
  ? undefined
  : query.parse(window.location.search).archive
;

module.exports = {
  RELEASE_ID: process.env.REACT_APP_RELEASE_ID,
  CODE_VERSION: process.env.REACT_APP_CODE_VERSION,
  REACT_APP_ARCHIVE_URL_OVERRIDE,

  FIXTURES: false,
  DEBUG: false,

  SENTRY_ENABLED: true,

  PORT: 8000,

  UNLIMITED_CONTENT: REACT_APP_ARCHIVE_URL_OVERRIDE !== undefined
};
