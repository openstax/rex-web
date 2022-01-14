import filter from 'lodash/fp/filter';
import flow from 'lodash/fp/flow';
import get from 'lodash/fp/get';
import identity from 'lodash/fp/identity';
import map from 'lodash/fp/map';
import max from 'lodash/fp/max';
import sitemap, { SitemapItemOptions } from 'sitemap';
import { writeAssetFile } from './fileUtils';

export const sitemapPath = (pathName: string) => `/rex/sitemaps/${pathName}.xml`;

export const renderAndSaveSitemap = async(
  saveFile: (path: string, contents: string) => unknown | Promise<unknown>,
  slug: string,
  urls: SitemapItemOptions[]
) => {
  const bookSitemap = sitemap.createSitemap({ hostname: 'https://openstax.org', urls });

  const filePath = sitemapPath(slug);

  await saveFile(filePath, bookSitemap.toString());

  return filePath;
};

export const renderAndSaveSitemapIndex = async(
  saveFile: (path: string, contents: string) => unknown | Promise<unknown>,
  urls: SitemapItemOptions[]
) => {
  const sitemapIndex = sitemap.buildSitemapIndex({ urls });

  const filePath = sitemapPath('index');

  await saveFile(filePath, sitemapIndex.toString());

  return filePath;
};

// renderSitemap() and renderSitemapIndex() are used only by single-instance prerender code

// Multi-instance code cannot store an array of sitemaps in memory and then use it across instances
const sitemaps: SitemapItemOptions[] = [];

export const renderSitemap = async(filename: string, urls: SitemapItemOptions[]) => {
  const lastmod = flow(
    map<SitemapItemOptions, (string | undefined)>(get('lastmod')),
    filter<string | undefined>(identity),
    max
  )(urls);

  const filePath = await renderAndSaveSitemap(writeAssetFile, filename, urls);

  const url = `https://openstax.org${filePath}`;

  sitemaps.push({url, lastmod});
};

export const renderSitemapIndex = async() => {
  return renderAndSaveSitemapIndex(writeAssetFile, sitemaps);
};
