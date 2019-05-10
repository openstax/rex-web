module.exports = {
  RELEASE_ID: 'development',
  CODE_VERSION: 'development',

  BOOKS: {
    '031da8d3-b525-429c-80cf-6c8ed997733a':{'defaultVersion':'14.4'},  // College Physics
    '8d50a0af-948b-4204-a71d-4826cba765b8':{'defaultVersion':'15.3'},  // Biology 2e
    '30189442-6998-4686-ac05-ed152b91b9de':{'defaultVersion':'23.28'}, // Introductory Statistics
    '02776133-d49d-49cb-bfaa-67c7f61b25a1':{'defaultVersion':'6.1'}, // Intermediate Algebra
  },

  ACCOUNTS_URL: process.env.ACCOUNTS_URL || 'https://accounts-dev.openstax.org',
  OS_WEB_URL: process.env.OS_WEB_URL || 'https://cms-dev.openstax.org',

  SKIP_OS_WEB_PROXY: process.env.SKIP_OS_WEB_PROXY !== undefined,
  FIXTURES: false,
  DEBUG: true,

  PORT: process.env.PORT ? parseInt(process.env.PORT, 10) : 8000,
};
