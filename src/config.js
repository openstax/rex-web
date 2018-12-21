/*
 * react-scripts start hardcodes NODE_ENV='development' but we run it in
 * testing for integration tests with REACT_APP_ENV='test'. in order to
 * prevent cross polution off config code between dev/prod we still use
 * NODE_ENV to switch configs here, but development is overloaded to include
 * test values and switches internally to return one or the other.
 *
 * because of this environment kerfuffle we use javascript config files
 * instead of .env.NODE_ENV files for committed configurations and its 
 * advisable to keep all environment checks and process.env variable 
 * wrangling within the config files, and use the exported values throughout
 * the rest of the code.
 */

let config = {
  ARCHIVE_URL: process.env.ARCHIVE_URL || 'https://archive.cnx.org/',
  OS_WEB_URL: process.env.OS_WEB_URL || 'https://openstax.org/',
  REACT_APP_ARCHIVE_URL: '/contents/',
  REACT_APP_OS_WEB_API_URL: '/api/v2/pages/',
};
if (process.env.NODE_ENV === 'production') {
  Object.assign(config, require('./config.production.js'));
} else {
  Object.assign(config, require('./config.development.js'));
}

module.exports = config;
