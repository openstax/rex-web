/*
 * this file is shared between webpack-dev-server and the pre-renderer
 */
const url = require('url');
const fs = require('fs');
const path = require('path');
const mime = require('mime');
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
  app.use((req, res, next) => {
    const parts = url.parse(req.url);
    const filePath = path.join(__dirname, 'test/fixtures', parts.pathname);
    const queryFilePath = path.join(filePath, parts.search ? encodeURIComponent(parts.search) : '');
    const indexFilePath = path.join(filePath, 'index.html');

    const sendFile = path => fs.readFile(path, (err, contents) => {
      res.end(contents);
    });

    const isFile = path =>
      fs.existsSync(path)
      && fs.existsSync(fs.realpathSync(path))
      && fs.lstatSync(fs.realpathSync(path)).isFile();

    const isDirectory = path => fs.existsSync(path) && fs.lstatSync(path).isDirectory();

    if (isFile(queryFilePath)) {
      sendFile(queryFilePath);
    } else if (isFile(filePath)) {
      sendFile(filePath);
    } else if (isDirectory(filePath) && isFile(indexFilePath)) {
      sendFile(indexFilePath);
    } else {
      next();
    }
  });
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
