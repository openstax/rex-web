const http = require('http');
const path = require('path');
const portfinder = require('portfinder');
const staticServer = require('serve-handler');

module.exports = (options = {}) => new Promise(resolve => {
  const fallback404 = !!options.fallback404;

  portfinder.getPortPromise().then(startServer);

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
});
