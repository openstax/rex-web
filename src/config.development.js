module.exports = {
  RELEASE_ID: 'development',
  CODE_VERSION: 'development',

  BOOKS: {
    '031da8d3-b525-429c-80cf-6c8ed997733a':{'defaultVersion':'14.4'}, // College Physics
    '8d50a0af-948b-4204-a71d-4826cba765b8':{'defaultVersion':'15.3'}, // Biology 2e
    '7fccc9cf-9b71-44f6-800b-f9457fd64335':{'defaultVersion':'6.1'},  // Chemistry 2e
    '14fb4ad7-39a1-4eee-ab6e-3ef2482e3e22':{'defaultVersion':'15.1'}, // Anatomy & Physiology
    '2e737be8-ea65-48c3-aa0a-9f35b4c6a966':{'defaultVersion':'20.1'}, // Astronomy
  },
  
  SKIP_OS_WEB_PROXY: process.env.SKIP_OS_WEB_PROXY !== undefined,
  FIXTURES: false,
  DEBUG: true,

  PORT: process.env.PORT ? parseInt(process.env.PORT, 10) : 8000,
};
