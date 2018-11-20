const connect = require('connect');
const http = require('http');
const serveStatic = require('serve-static')
const path = require('path');
const portfinder = require('portfinder');
const staticServer = require('serve-handler');
const setupProxy = require('../src/setupProxy');

module.exports = (options = {}) => new Promise(resolve => {
  const fallback404 = !!options.fallback404;

  portfinder.getPortPromise().then(startServer);

  function startServer(port) {
    const serve = serveStatic(path.join(__dirname, '../build'));
    const fallback = (req, res, next) => serve(Object.assign({}, req, {url: '/'}), res, next);

    const app = connect();

    app.use(serve);

    setupProxy(app);

    if (fallback404) {
      app.use(fallback);
    }

    const server = http.createServer(app);

    server.listen(port);
    resolve({server, port});
  }
});
