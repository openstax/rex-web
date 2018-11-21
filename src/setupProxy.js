/*
 * this file is shared between webpack-dev-server and the pre-renderer
 */
const path = require('path');
const serveStatic = require('serve-static')
require('./env');

const proxy = require('http-proxy-middleware');

const archivePaths = [
  'contents',
  'resources',
  'specials',
];


module.exports = function(app) {
  process.env.NODE_ENV === 'test' || process.env.CI
    ? setupTestProxy(app)
    : setupProxy(app);
};

function setupTestProxy(app) {
  app.use(serveStatic(path.join(__dirname, 'test/fixtures/archive')));
}

function setupProxy(app) {
  const ARCHIVE_URL = process.env.ARCHIVE_URL;

  archivePaths.forEach(path => app.use(proxy(`/${path}`, {
    target: `${ARCHIVE_URL}${path}/`,
    prependPath: false,
    changeOrigin: true,
  })));
}
