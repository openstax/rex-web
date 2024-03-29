import { readFile, writeFile } from 'fs';
import asyncPool from 'tiny-async-pool';
import argv from 'yargs';
import { checkLighthouse, ScoreTargets } from '../src/test/browserutils';

const {
  pages, mostRecentReportDir, reportDir,
} = argv.string('pages').string('mostRecentReportDir').string('reportDir').argv;

if (!pages) { throw new Error('You must specify some --pages to test'); }

const pageArray: string[] = JSON.parse(pages);

await asyncPool(1, pageArray, async(pageUrl) => {
  const filename = `${pageUrl.replace(/[^a-z0-9]+/gi, '-')}.json`;
  const targets = mostRecentReportDir ? await new Promise<ScoreTargets | undefined>(
    (resolve) => readFile(
      `${mostRecentReportDir}/${filename}`,
      { encoding: 'utf8' },
      (err, data) => err ? resolve(undefined) : resolve(JSON.parse(data))
    )
  ) : undefined;

  const result = await checkLighthouse(browser, pageUrl, targets);

  if (reportDir) {
    await new Promise<void>((resolve) => writeFile(
      `${reportDir}/${filename}`,
      JSON.stringify(result), () => resolve()
    ));
  }
});
