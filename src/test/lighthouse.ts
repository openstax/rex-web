import lighthouse from 'lighthouse';
import { Browser } from 'puppeteer';
import * as lighthouseConfig from './audits';
import url from './url';

type Categories = Awaited<ReturnType<typeof lighthouse>>['lhr']['categories'];
export type ScoreTargets = { [key in keyof Categories]?: number };

const testedCategories: Array<keyof Categories> = [
  'accessibility', 'best-practices', 'customAccessibility', 'pwa', 'seo',
];

export const checkLighthouse = async(target: Browser, urlPath: string, scoreTargets?: ScoreTargets) => {
  const absoluteUrl = urlPath.startsWith('https://') || urlPath.startsWith('http://') ? urlPath : url(urlPath);
  const port = Number((new URL(target.wsEndpoint())).port);
  const { lhr } = await lighthouse(absoluteUrl, {port}, lighthouseConfig);

  const result: ScoreTargets = {};
  testedCategories.forEach((category) => {
    const categoryReport = lhr.categories[category];
    const { score, auditRefs } = categoryReport;
    if (scoreTargets) {
      const minScore = scoreTargets[category];

      if (minScore && score < minScore) {

        auditRefs.forEach(auditRef => {
          const audit = lhr.audits[auditRef.id];
          if (auditRef.weight > 0 && audit.score < 1) {
            console.log(JSON.stringify(audit, null, 2)); // tslint:disable-line:no-console
          }
        });
        throw new Error(`${category} score of ${score} was less than the minimum of ${minScore}`);
      }
    }
    result[category] = score;
  });

  return result;
};
