const connect = require('connect');
const http = require('http');
const serveStatic = require('serve-static')
const path = require('path');
const setupProxy = require('../src/setupProxy');
require('../src/env');

const SERVER_PORT = process.env.SERVER_PORT;

if (Number.isNaN(SERVER_PORT)) {
  throw new Error(`BUG: SERVER_PORT is not defined. Add it to .env.${process.env.NODE_ENV}`)
}

module.exports = (options = {}) => new Promise(resolve => {
  const fallback404 = !!options.fallback404;

  const serve = serveStatic(path.join(__dirname, '../build'));
  const fallback = (req, res, next) => serve(Object.assign({}, req, {url: '/'}), res, next);

  const app = connect();

  app.use(serve);

  setupProxy(app);

  if (fallback404) {
    app.use(fallback);
  }

  const server = http.createServer(app);

  server.listen(SERVER_PORT, () => resolve({server, port: SERVER_PORT}));
});
