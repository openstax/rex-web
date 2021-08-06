const {SEARCH_URL, REACT_APP_SEARCH_URL} = require('./config');

module.exports = [
  {
    name: 'open-search-client',
    api_host: SEARCH_URL.substring(8) /* remove protocol */,
    swagger_path: REACT_APP_SEARCH_URL + '/swagger',
    secure: true
  },
  {
    name: 'placements-client',
    api_host: 'jp3.placements.sandbox.openstax.org',
    swagger_path: '/api/v0/swagger.json',
    secure: true
  },
]
