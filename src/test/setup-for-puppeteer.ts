if (process.env.CI) {
  // set default timeout to something quite large in CI
  jest.setTimeout(90 * 1000);
} else {
  jest.setTimeout(120 * 1000);
}

const blockedRequests = [
  /^https?:\/\/(?:www\.)?googletagmanager\.com/,
  /^https?:\/\/js\.pulseinsights\.com/,
];

beforeAll(async() => {
  await page.setRequestInterception(true);

  page.on('request', (request) => {
    const url = request.url();

    if (blockedRequests.some((blockedRequest) => blockedRequest.test(url))) {
      return request.abort();
    }

    request.continue();
  });
});

// export to prevent isolatedModules error
export {};
