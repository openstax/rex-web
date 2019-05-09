module.exports = {
  RELEASE_ID: 'development',
  CODE_VERSION: 'development',

  BOOKS: {
    '031da8d3-b525-429c-80cf-6c8ed997733a':{'defaultVersion':'14.4'}, // College Physics
    '8d50a0af-948b-4204-a71d-4826cba765b8':{'defaultVersion':'15.3'}, // Biology 2e
    '7fccc9cf-9b71-44f6-800b-f9457fd64335':{'defaultVersion':'6.1'},  // Chemistry 2e
    '14fb4ad7-39a1-4eee-ab6e-3ef2482e3e22':{'defaultVersion':'15.1'}, // Anatomy & Physiology
    '2e737be8-ea65-48c3-aa0a-9f35b4c6a966':{'defaultVersion':'20.1'}, // Astronomy
    '4abf04bf-93a0-45c3-9cbc-2cefd46e68cc':{'defaultVersion':'10.16'}, // Psychology
    // '9ab4ba6d-1e48-486d-a2de-38ae1617ca84':{'defaultVersion':'4.25'}, // Principles of Accounting, Volume 1: Financial Accounting. Broken because contains link to external content.
    '4e09771f-a8aa-40ce-9063-aa58cc24e77f':{'defaultVersion':'8.5', bookStyleName:'intro-business'}, // Introduction to Business
    'bc498e1f-efe9-43a0-8dea-d3569ad09a82':{'defaultVersion':'7.1'}, // Principles of Economics 2e
    'caa57dab-41c7-455e-bd6f-f443cda5519c':{'defaultVersion':'18.1'}, // Prealgebra
    // 'fd53eae1-fa23-47c7-bb1b-972349835c3c':{'defaultVersion':'10.3'}, // Precalculus. Broken because contains link to external content.
    '914ac66e-e1ec-486d-8a9c-97b0f7a99774':{defaultVersion:'4.1'}, // Business Ethics
    '02776133-d49d-49cb-bfaa-67c7f61b25a1':{defaultVersion:'6.1'}, // Intermediate Algebra
    '9d8df601-4f12-4ac1-8224-b450bf739e5f':{defaultVersion:'5.1'}, // American Government 2e
  },

  ACCOUNTS_URL: process.env.ACCOUNTS_URL || 'https://accounts-dev.openstax.org',
  OS_WEB_URL: process.env.OS_WEB_URL || 'https://openstax.org',

  SKIP_OS_WEB_PROXY: process.env.SKIP_OS_WEB_PROXY !== undefined,
  FIXTURES: false,
  DEBUG: true,

  PORT: process.env.PORT ? parseInt(process.env.PORT, 10) : 8000,
};
