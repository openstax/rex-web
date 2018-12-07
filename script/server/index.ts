import express from 'express';
import http from 'http';
import path from 'path';
import serveStatic from 'serve-static';
import '../../src/env';
import setupProxy from '../../src/setupProxy';

interface Options {
  fallback404?: boolean;
  onlyProxy?: boolean;
  port?: number;
}

export default (options: Options): Promise<{server: http.Server, port: number}> => new Promise((resolve) => {
  const defaultOptions = {
    port: process.env.PORT ? parseInt(process.env.PORT, 10) : undefined,
  };
  const fallback404 = !!options.fallback404;
  const baseDir = path.join(__dirname, '../../build');
  const {port, onlyProxy} = {...defaultOptions, ...options};

  if (!port || Number.isNaN(port) || port <= 0) {
    throw new Error(`BUG: port is not defined. Add PORT to .env.${process.env.NODE_ENV} or pass the 'port' option.`); // tslint:disable-line:max-line-length
  }

  const app = express();

  setupProxy(app);

  if (!onlyProxy) {
    const setHeaders = (res: http.ServerResponse, file: string) => {
      if (file.match(`^${baseDir}/(books|errors)`)) {
        res.setHeader('Content-Type', 'text/html');
      }
    };

    const serve = serveStatic(baseDir, {setHeaders});
    const fallback = (url: string): express.Handler => (req, res, next) => {
      req.url = url;
      serve(req, res, next);
    };

    app.use(serve);

    if (fallback404) {
      app.use(fallback('/'));
    } else {
      app.use(fallback('/errors/404'));
    }
  }

  const server = http.createServer(app);

  server.listen(port, () => resolve({server, port}));
});
