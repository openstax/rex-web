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
  console.info('WEBSERVER: Including fixtures');
  const setHeaders = res => res.setHeader('Content-Type', 'application/json');
  app.use(serveStatic(path.join(__dirname, 'test/fixtures/archive'), {setHeaders}));
}

function setupProxy(app) {
  const ARCHIVE_URL = process.env.ARCHIVE_URL;

  if (!ARCHIVE_URL) {
    throw new Error('ARCHIVE_URL environment variable must be defined');
  }

  archivePaths.forEach(path => app.use(proxy(`/${path}`, {
    target: `${ARCHIVE_URL}${path}/`,
    prependPath: false,
    changeOrigin: true,
  })));
}
