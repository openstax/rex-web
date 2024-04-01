const url = (path: string) => `http://localhost:${puppeteerConfig.server.port}/${path.replace(/^\/+/, '')}`;

export default url;
