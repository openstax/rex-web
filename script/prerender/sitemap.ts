import filter from 'lodash/fp/filter';
import flow from 'lodash/fp/flow';
import get from 'lodash/fp/get';
import identity from 'lodash/fp/identity';
import map from 'lodash/fp/map';
import max from 'lodash/fp/max';
import sitemap, { SitemapItemOptions } from 'sitemap';
import { writeAssetFile, writeS3File } from './fileUtils';

export const sitemapPath = (pathName: string) => `/rex/sitemaps/${pathName}.xml`;

// renderSitemap() and renderSitemapIndex() are used only by single-instance prerender code

// Multi-instance code cannot store an array of sitemaps in memory and then use it across instances
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

// renderSitemapToS3() and renderSitemapIndexToS3() are used only by multi-instance prerender code

export const renderSitemapToS3 = (slug: string, urls: SitemapItemOptions[]) => {
  const bookSitemap = sitemap.createSitemap({ hostname: 'https://openstax.org', urls });

  const filePath = sitemapPath(slug);

  writeS3File(filePath, bookSitemap.toString(), 'text/xml');
};

export const renderSitemapIndexToS3 = (urls: SitemapItemOptions[]) => {
  const sitemapIndex = sitemap.buildSitemapIndex({ urls });
  writeS3File(sitemapPath('index'), sitemapIndex.toString(), 'text/xml');
};
