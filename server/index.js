const connect = require('connect');
const http = require('http');
const serveStatic = require('serve-static')
const path = require('path');
const setupProxy = require('../src/setupProxy');

module.exports = (options = {}) => new Promise(resolve => {
  const fallback404 = !!options.fallback404;
  const baseDir = path.join(__dirname, '../build');
  const port = process.env.PORT;

  if (!port) {
    console.error('please specify port');
    process.exit(1);
  }

  const setHeaders = (res, file) => {
    if (file.match(`^${baseDir}/(books|errors)`)) {
      res.setHeader('Content-Type', 'text/html');
    }
  };

  const serve = serveStatic(path.join(__dirname, '../build'), {setHeaders});
  const fallback = url => (req, res, next) => serve(Object.assign({}, req, {url}), res, next);

  const app = connect();

  app.use(serve);

  setupProxy(app);

  if (fallback404) {
    app.use(fallback('/'));
  } else {
    app.use(fallback('/errors/404'));
  }

  const server = http.createServer(app);

  server.listen(port);
  resolve({server, port});
});
