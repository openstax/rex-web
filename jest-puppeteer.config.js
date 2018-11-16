module.exports = {
  launch: {
    executablePath: process.env.PUPPETEER_CHROME_PATH,
    args: [
      '--disable-dev-shm-usage',
      '--font-render-hinting=medium',
      '--lang=en-US,en'
    ],
  },
  server: {
    command: 'PORT=8000 BROWSER=none yarn start',
    port: 8000,
  },
}
