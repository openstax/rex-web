module.exports = {
  RELEASE_ID: 'development',
  CODE_VERSION: 'development',

  BOOKS: {
    '9ab4ba6d-1e48-486d-a2de-38ae1617ca84':{defaultVersion:'4.25'}, // Principles of Accounting, Volume 1: Financial Accounting. Broken because contains link to external content.
    '920d1c8a-606c-4888-bfd4-d1ee27ce1795': {defaultVersion: '14.1'}, // Principles of Accounting, Volume 2
    // 'fd53eae1-fa23-47c7-bb1b-972349835c3c':{defaultVersion:'10.3'}, // Precalculus. Broken because contains link to external content.
  },

  ACCOUNTS_URL: process.env.ACCOUNTS_URL || 'https://accounts-dev.openstax.org',
  OS_WEB_URL: process.env.OS_WEB_URL || 'https://cms-prod.openstax.org',
  SEARCH_URL: process.env.SEARCH_URL || 'https://search-may28c.sandbox.openstax.org',

  SKIP_OS_WEB_PROXY: process.env.SKIP_OS_WEB_PROXY !== undefined,
  FIXTURES: false,
  DEBUG: true,

  PORT: process.env.PORT ? parseInt(process.env.PORT, 10) : 8000,
};
