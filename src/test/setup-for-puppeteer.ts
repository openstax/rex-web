if (process.env.CI) {
  // set default timeout to something quite large in CI
  jest.setTimeout(90 * 1000);
} else {
  jest.setTimeout(120 * 1000);
}

// export to prevent isolatedModules error
export {};
