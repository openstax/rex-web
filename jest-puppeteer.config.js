module.exports = {
  launch: {
    executablePath: process.env.PUPPETEER_CHROME_PATH,
    args: [
      // https://developers.google.com/web/tools/puppeteer/troubleshooting
      '--disable-dev-shm-usage',
      // https://github.com/GoogleChrome/puppeteer/issues/2410
      '--font-render-hinting=medium',
      // https://github.com/GoogleChrome/puppeteer/issues/1846
      '--proxy-server="direct://"',
      '--proxy-bypass-list=*'
    ],
  },
  server: {
    launchTimeout: 30000,
    command: 'PORT=8000 BROWSER=none yarn start',
    port: 8000,
  },
}
