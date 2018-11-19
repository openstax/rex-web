import { MatchImageSnapshotOptions, toMatchImageSnapshot } from 'jest-image-snapshot';
import { Page } from 'puppeteer';

type ToMatchImageSnapshot = (image: Buffer, config: MatchImageSnapshotOptions) => {pass: boolean, message(): string};

export default async function(this: jest.MatcherUtils, page: Page, config: {[key: string]: MatchImageSnapshotOptions}) {
  jest.setTimeout(30000);

  const screen = await page.screenshot({fullPage: true});

  const options = process.env.CI
    ? config.CI
    : config.DEV;

  return (toMatchImageSnapshot as ToMatchImageSnapshot).bind(this)(screen, options || {
    failureThreshold: 0,
  });
}
