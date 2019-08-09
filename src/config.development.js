module.exports = {
  RELEASE_ID: 'development',
  CODE_VERSION: 'development',
  DEPLOYED_ENV: 'development',

  ACCOUNTS_URL: process.env.ACCOUNTS_URL || 'https://accounts.openstax.org',
  OS_WEB_URL: process.env.OS_WEB_URL || 'https://cms-prod.openstax.org',
  SEARCH_URL: process.env.SEARCH_URL || 'https://search-jul11.sandbox.openstax.org',
  ENVIRONMENT_URL: 'https://release-10.sandbox.openstax.org/rex/environment.json',

  SKIP_OS_WEB_PROXY: process.env.SKIP_OS_WEB_PROXY !== undefined,
  FIXTURES: false,
  DEBUG: true,
  FEATURES_NOTIFICATION: true,

  PORT: process.env.PORT ? parseInt(process.env.PORT, 10) : 8000,
};
