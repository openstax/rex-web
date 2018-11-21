module.exports = {
  launch: {
    executablePath: process.env.PUPPETEER_CHROME_PATH,
    args: [
      // https://github.com/GoogleChrome/puppeteer/issues/2410
      '--font-render-hinting=medium',
    ],
  },
  server: {
    launchTimeout: 60000,
    command: 'PORT=8000 BROWSER=none yarn start',
    port: 8000,
  },
}
