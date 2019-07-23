import sitemap from 'sitemap';
import { matchUrl } from '../../src/app/navigation/utils';
import { Pages } from './contentPages';
import { writeAssetFile } from './fileUtils';

const rexSitemap = sitemap.createSitemap({
  hostname: 'https://openstax.org',
});

export const addSitemapPages = (pages: Pages) => {
  pages.forEach((record) => rexSitemap.add({url: matchUrl(record.page)}));
};

export const renderSitemap = () => {
  writeAssetFile('/rex/sitemap.xml', rexSitemap.toString());
};
