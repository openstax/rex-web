import { readFile, writeFile } from 'fs';
import asyncPool from 'tiny-async-pool';
import { checkLighthouse, ScoreTargets } from '../../src/test/browserutils.ts';

if (!process.env.LIGHTHOUSE_PAGES ||
    !process.env.LIGHTHOUSE_MOST_RECENT_REPORT_DIR ||
    !process.env.LIGHTHOUSE_REPORT_DIR) {
  throw new Error(
    'You must define the LIGHTHOUSE_PAGES, LIGHTHOUSE_MOST_RECENT_REPORT_DIR and LIGHTHOUSE_REPORT_DIR env variables'
  );
}

const pages: string[] = JSON.parse(process.env.LIGHTHOUSE_PAGES);

await asyncPool(1, pages, async(pageUrl) => {
  const filename = `${pageUrl.replace(/[^a-z0-9]+/gi, '-')}.json`;
  const targets = await new Promise<ScoreTargets | undefined>(
    (resolve) => readFile(
      `${process.env.LIGHTHOUSE_MOST_RECENT_REPORT_DIR}/${filename}`,
      { encoding: 'utf8' },
      (err, data) => err ? resolve(undefined) : resolve(JSON.parse(data))
    )
  );
  const result = await checkLighthouse(browser, pageUrl, targets);
  await new Promise<void>((resolve) => writeFile(
    `${process.env.LIGHTHOUSE_REPORT_DIR}/${filename}`,
    JSON.stringify(result), () => resolve()
  ));
});
