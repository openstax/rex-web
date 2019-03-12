module.exports = {
  RELEASE_ID: 'development',
  CODE_VERSION: 'development',

  BOOKS: {'031da8d3-b525-429c-80cf-6c8ed997733a':{'defaultVersion':'14.4'}},

  SKIP_OS_WEB_PROXY: process.env.SKIP_OS_WEB_PROXY !== undefined,
  FIXTURES: false,
  DEBUG: true,

  PORT: process.env.PORT ? parseInt(process.env.PORT, 10) : 8000,
};
