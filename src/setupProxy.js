/*
 * this file is shared between webpack-dev-server and the pre-renderer
 */
const url = require('url');
const util = require('util');
const fs = require('fs');
const path = require('path');
const proxy = require('http-proxy-middleware');
const {
  SKIP_OS_WEB_PROXY,
  FIXTURES,
  ARCHIVE_URL,
  OS_WEB_URL,
  SEARCH_URL,
  HIGHLIGHTS_URL,
  ACCOUNTS_URL,
  REACT_APP_ACCOUNTS_URL,
  REACT_APP_SEARCH_URL,
  REACT_APP_HIGHLIGHTS_URL,
  REACT_APP_OS_WEB_API_URL,
  REACT_APP_ARCHIVE_URL,
} = require('./config');
const requireBabelConfig = require('./babel-config');

requireBabelConfig();

const { default: prepareRedirects } = require('../script/utils/prepareRedirects');
const { default: createArchiveLoader } = require('./gateways/createArchiveLoader');
const { default: createOSWebLoader } = require('./gateways/createOSWebLoader');

const archiveLoader = createArchiveLoader(`${ARCHIVE_URL}${REACT_APP_ARCHIVE_URL}`, REACT_APP_ARCHIVE_URL);
const osWebLoader = createOSWebLoader(`${ARCHIVE_URL}${REACT_APP_OS_WEB_API_URL}`);

const archivePaths = [
  '/apps/archive',
  '/extras',
  '/contents',
  '/resources',
  '/specials',
];

module.exports = function(app) {
  FIXTURES
    ? setupTestProxy(app)
    : setupProxy(app);
};

function getReqInfo(request) {
  const {search, pathname} = url.parse(request.url);
  const cookie = request.headers.cookie || '';
  return {
    search,
    pathname,
    authenticated: cookie.includes('session')
  };
}

const isFile = path =>
  fs.existsSync(path)
  && fs.existsSync(fs.realpathSync(path))
  && fs.lstatSync(fs.realpathSync(path)).isFile();

const isDirectory = path => fs.existsSync(path) && fs.lstatSync(path).isDirectory();

const loadFileContents = (path) => new Promise((resolve, reject) =>
  fs.readFile(path, (err, contents) => err ? reject(err) : resolve(contents))
);

const sendFile = (res, path) => {
  const body = loadFileContents(path);
  const status = loadFileContents(`${path}.status`)
    .catch(() => 200);

  Promise.all([body, status]).then(([body, status]) => {
    res.status(status);
    res.end(body);
  });
};

const sendJSON = (res, json, status = 200) => {
  res.status(status);
  res.end(JSON.stringify(json));
}

const findFileIn = (baseDir, reqInfo) => {
  const filePath = path.join(baseDir, reqInfo.pathname);
  const queryFilePath = path.join(filePath,
    reqInfo.search ? encodeURIComponent(reqInfo.search) : ''
  );
  const indexFilePath = path.join(filePath, 'index.html');

  if (isFile(queryFilePath)) {
    return queryFilePath;
  } else if (isFile(filePath)) {
    return filePath;
  } else if (isDirectory(filePath) && isFile(indexFilePath)) {
    return indexFilePath;
  } else {
    return null;
  }
};

function setupTestProxy(app) {
  console.info('WEBSERVER: Including fixtures');

  app.use((req, res, next) => {
    const reqInfo = getReqInfo(req);

    const fixtureDir = path.join(__dirname, 'test/fixtures');
    const authFile = findFileIn(path.join(fixtureDir, 'authenticated'), reqInfo);
    const publicFile = findFileIn(fixtureDir, reqInfo);

    if (authFile && reqInfo.authenticated) {
      sendFile(res, authFile);
    } else if (publicFile) {
      sendFile(res, publicFile);
    } else {
      next();
    }
  });
}

function archiveProxy(app) {
  archivePaths.forEach(path => app.use(proxy(path, {
    target: `${ARCHIVE_URL}${path}`,
    prependPath: false,
    changeOrigin: true,
  })));
}

function accountsProxy(app) {
  app.use(proxy(REACT_APP_ACCOUNTS_URL, {
    target: ACCOUNTS_URL,
    changeOrigin: true,
    autoRewrite: true,
    cookieDomainRewrite: "",
    onProxyReq: (preq, req, res) => {
      preq.setHeader('host', req.headers.host);
    }
  }));
}

function searchProxy(app) {
  app.use(proxy(REACT_APP_SEARCH_URL, {
    target: SEARCH_URL,
    changeOrigin: true,
    autoRewrite: true,
  }));
}

function highlightsProxy(app) {
  app.use(proxy(REACT_APP_HIGHLIGHTS_URL, {
    target: HIGHLIGHTS_URL,
    changeOrigin: true,
    autoRewrite: true,
  }));
}

function osWebApiProxy(app) {
  app.use(proxy(REACT_APP_OS_WEB_API_URL, {
    target: OS_WEB_URL,
    changeOrigin: true,
  }));
}

function osWebProxy(app) {
  app.use(proxy((path) => !path.match(/^\/((books\/.*)|static.*|errors.*|rex.*|manifest.json|precache-manifest.*|index.html|\/)?$/) , {
    target: OS_WEB_URL,
    changeOrigin: true,
  }));
}

function stubEnvironment(app) {
  app.use((req, res, next) => {
    const  {pathname} = url.parse(req.url);

    if (pathname === '/rex/environment.json') {
      const envFile = path.join(__dirname, 'environment.development.json');
      sendFile(res, envFile);
    } else {
      next();
    }
  });
}

function stubRedirects(app) {
  const redirects = prepareRedirects(archiveLoader, osWebLoader)
    .then((data) => {
      const developmentRedirects = require('./redirects.development.json');
      data.push(...developmentRedirects);
      return data;
    });

  app.use(async(req, res, next) => {
    const {pathname} = url.parse(req.url);

    if (pathname === '/rex/redirects.json') {
      sendJSON(res, await redirects);
    } else {
      next();
    }
  });
}

function stubRelease(app) {
  app.use((req, res, next) => {
    const {pathname} = url.parse(req.url);

    if (pathname === '/rex/release.json') {
      const releaseFile = path.join(__dirname, 'release.development.json');
      sendFile(res, releaseFile);
    } else {
      next();
    }
  })
}

async function setupProxy(app) {
  if (!ARCHIVE_URL) { throw new Error('ARCHIVE_URL configuration must be defined'); }
  if (!OS_WEB_URL) { throw new Error('OS_WEB_URL configuration must be defined'); }

  archiveProxy(app);
  accountsProxy(app);
  searchProxy(app);
  highlightsProxy(app);
  osWebApiProxy(app);
  stubEnvironment(app);
  stubRedirects(app);
  stubRelease(app);

  if (!SKIP_OS_WEB_PROXY) {
    osWebProxy(app);
  }
}
