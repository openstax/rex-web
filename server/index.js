const connect = require('connect');
const http = require('http');
const serveStatic = require('serve-static')
const path = require('path');
const portfinder = require('portfinder');
const setupProxy = require('../src/setupProxy');

module.exports = (options = {}) => new Promise(resolve => {
  const fallback404 = !!options.fallback404;
  const baseDir = path.join(__dirname, '../build');

  portfinder.getPortPromise().then(startServer);

  const setHeaders = (res, file) => {
    if (file.indexOf(path.join(baseDir, '/books')) === 0) {
      res.setHeader('Content-Type', 'text/html');
    }
  };

  function startServer(port) {
    const serve = serveStatic(path.join(__dirname, '../build'), {setHeaders});
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
