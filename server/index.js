const http = require('http');
const path = require('path');
const staticServer = require('serve-handler');
require('dotenv').config();

module.exports = (options = {}) => new Promise(resolve => {
  const fallback404 = !!options.fallback404;

  const port = process.env.SERVER_PORT

  function startServer(port) {
    const server = http.createServer((request, response) => {
      const config = {
        public: path.join(__dirname, '../build'),
      };

      const methods = {};

      if (fallback404) {
        methods.sendError = (_, response) => staticServer(Object.assign({}, request, {url: '/'}), response, config);
      }

      staticServer(request, response, config, methods);
    });

    server.listen(port);
    resolve({server, port});
  }

  startServer(port);
});
