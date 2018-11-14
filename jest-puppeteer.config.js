module.exports = {
  launch: {
    executablePath: process.env.PUPPETEER_CHROME_PATH,
    args: [
      '--disable-dev-shm-usage',
    ],
  },
  server: {
    command: 'yarn server',
    port: 8000,
  },
}
