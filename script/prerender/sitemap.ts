import filter from 'lodash/fp/filter';
import flow from 'lodash/fp/flow';
import get from 'lodash/fp/get';
import identity from 'lodash/fp/identity';
import map from 'lodash/fp/map';
import max from 'lodash/fp/max';
import sitemap, { SitemapItemOptions } from 'sitemap';
import { writeAssetFile } from './fileUtils';

const sitemapPath = (pathName: string) => `/rex/sitemaps/${pathName}.xml`;
const sitemaps: SitemapItemOptions[] = [];

export const renderSitemap = (filename: string, urls: SitemapItemOptions[]) => {
  const bookSitemap = sitemap.createSitemap({ hostname: 'https://openstax.org', urls });
  const lastmod = flow(
    map<SitemapItemOptions, (string | undefined)>(get('lastmod')),
    filter<string | undefined>(identity),
    max
  )(urls);

  const filePath = sitemapPath(filename);
  const url = `https://openstax.org${filePath}`;

  sitemaps.push({url, lastmod});
  writeAssetFile(filePath, bookSitemap.toString());
};

export const renderSitemapIndex = () => {
  const sitemapIndex = sitemap.buildSitemapIndex({ urls: sitemaps });
  writeAssetFile(sitemapPath('index'), sitemapIndex.toString());
};
