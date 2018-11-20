/*
 * this file is shared between webpack-dev-server and the pre-renderer
 */
require('./env');

const proxy = require('http-proxy-middleware');

const archivePaths = [
  'contents',
  'resources',
  'specials',
];

const ARCHIVE_URL = process.env.ARCHIVE_URL;

module.exports = function(app) {
  archivePaths.forEach(path => app.use(proxy(`/${path}`, {
    target: `${ARCHIVE_URL}/${path}/`,
    prependPath: false,
    changeOrigin: true,
  })));
};
