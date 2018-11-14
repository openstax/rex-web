module.exports = {
  launch: {
    executablePath: process.env.PUPPETEER_CHROME_PATH,
    args: [
      '--disable-dev-shm-usage',
    ],
  }
}
