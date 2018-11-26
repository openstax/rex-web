const connect = require('connect');
const http = require('http');
const serveStatic = require('serve-static')
const path = require('path');
const setupProxy = require('../src/setupProxy');
require('dotenv').config();

module.exports = (options = {}) => new Promise(resolve => {
  const fallback404 = !!options.fallback404;

  const port = process.env.SERVER_PORT

  const serve = serveStatic(path.join(__dirname, '../build'));
  const fallback = (req, res, next) => serve(Object.assign({}, req, {url: '/'}), res, next);

  const app = connect();

  app.use(serve);

  setupProxy(app);

  if (fallback404) {
    app.use(fallback);
  }

  const server = http.createServer(app);

  server.listen(port, () => resolve({server, port}));
});
