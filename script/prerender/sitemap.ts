import sitemap, { SitemapItemOptions } from 'sitemap';
import { SerializedPageMatch } from './contentRoutes';
import { writeAssetFile } from './fileUtils';
import { BookWithOSWebData } from '../../src/app/content/types';
import { getSitemapItemOptions } from './contentPages';

export const sitemapPath = (pathName: string) => `/rex/sitemaps/${pathName}.xml`;

export type SitemapPayload = { pages: SerializedPageMatch[], slug: string };

export const renderAndSaveSitemap = async(
  saveFile: (path: string, contents: string) => Promise<unknown>,
  slug: string,
  urls: SitemapItemOptions[]
) => {
  const bookSitemap = sitemap.createSitemap({ hostname: 'https://openstax.org', urls });

  const filePath = sitemapPath(slug);

  await saveFile(filePath, bookSitemap.toString());

  return filePath;
};

export const renderAndSaveSitemapIndex = async(
  saveFile: (path: string, contents: string) => Promise<unknown>,
  books: BookWithOSWebData[]
) => {
  const sitemapIndex = sitemap.buildSitemapIndex({urls: books.map(book =>
    getSitemapItemOptions(book, `https://openstax.org${sitemapPath(book.slug)}`)
  )});

  const filePath = sitemapPath('index');

  await saveFile(filePath, sitemapIndex.toString());
};

// renderSitemap() and renderSitemapIndex() are used only by single-instance prerender code

const writeAssetFileAsync = async(filepath: string, contents: string) => {
  return writeAssetFile(filepath, contents);
};

export const renderSitemap = async(filename: string, urls: SitemapItemOptions[]) => {
  await renderAndSaveSitemap(writeAssetFileAsync, filename, urls);
};

export const renderSitemapIndex = async(books: BookWithOSWebData[]) => {
  return renderAndSaveSitemapIndex(writeAssetFileAsync, books);
};
