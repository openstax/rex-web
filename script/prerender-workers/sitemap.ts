import sitemap, { SitemapItemOptions } from 'sitemap';
import { writeS3File } from './fileUtils';

export const sitemapPath = (pathName: string) => `/rex/sitemaps/${pathName}.xml`;

export const renderSitemap = (slug: string, urls: SitemapItemOptions[]) => {
  const bookSitemap = sitemap.createSitemap({ hostname: 'https://openstax.org', urls });

  const filePath = sitemapPath(slug);

  writeS3File(filePath, bookSitemap.toString());
};

export const renderSitemapIndex = (urls: SitemapItemOptions[]) => {
  const sitemapIndex = sitemap.buildSitemapIndex({ urls });
  writeS3File(sitemapPath('index'), sitemapIndex.toString());
};
