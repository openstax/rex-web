import sitemap, { SitemapItemOptions } from 'sitemap';
import { writeAssetFile } from './fileUtils';

export const sitemapPath = (pathName: string) => `/rex/sitemaps/${pathName}.xml`;

export const renderSitemap = (slug: string, urls: SitemapItemOptions[]) => {
  const bookSitemap = sitemap.createSitemap({ hostname: 'https://openstax.org', urls });

  const filePath = sitemapPath(slug);

  writeAssetFile(filePath, bookSitemap.toString());
};

export const renderSitemapIndex = (urls: SitemapItemOptions[]) => {
  const sitemapIndex = sitemap.buildSitemapIndex({ urls });
  writeAssetFile(sitemapPath('index'), sitemapIndex.toString());
};
