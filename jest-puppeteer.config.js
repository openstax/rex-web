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
    // react-scripts start unconditionally sets the NODE_ENV to development,
    // so we're setting CI here even if that isn't necessarily true
    command: process.env.SERVER_MODE === 'built'
      ? 'CI=true PORT=8000 yarn server'
      : 'CI=true PORT=8000 BROWSER=none yarn start',
    port: 8000,
  },
}
