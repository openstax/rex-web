const {SEARCH_URL, REACT_APP_SEARCH_URL} = require('./config');

module.exports = [
  {
    name: "open-search",
    api_host: SEARCH_URL.substring(7) /* remove protocol */,
    swagger_path: REACT_APP_SEARCH_URL + '/swagger',
    secure: true
  },
  {
    name: 'placements',
    api_host: 'jp3.placements.sandbox.openstax.org',
    swagger_path: '/api/v0/swagger.json',
    secure: true
  },
]
