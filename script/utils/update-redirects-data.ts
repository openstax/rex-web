import fs from 'fs';
import { isEqual } from 'lodash/fp';
import path from 'path';
import { RedirectsData } from '../../data/redirects/types';
import { content } from '../../src/app/content/routes';
import { BookWithOSWebData, LinkedArchiveTreeNode } from '../../src/app/content/types';
import { flattenArchiveTree } from '../../src/app/content/utils';

const redirectsPath = path.resolve(__dirname, '../../data/redirects/');

const updateRedirectsData = async(currentBook: BookWithOSWebData, newBook: BookWithOSWebData) => {
  if (currentBook.id !== newBook.id) {
    throw new Error(
      `updateRedirects requires two instances of the same book, `
      + `but you've passed ${currentBook.id} and ${newBook.id}`);
  }
  const redirectsBookPath = path.resolve(redirectsPath, currentBook.id + '.json');
  const redirects: RedirectsData = fs.existsSync(redirectsBookPath) ? await import(redirectsBookPath) : [];

  const flatCurrentTree = flattenArchiveTree(currentBook.tree).filter((section) => section.id !== currentBook.id);
  const flatNewTree = flattenArchiveTree(newBook.tree).filter((section) => section.id !== currentBook.id);

  const formatSection = (section: LinkedArchiveTreeNode) => ({
    bookId: currentBook.id,
    pageId: section.id,
    pathname: content.getUrl({ book: { slug: currentBook.slug }, page: { slug: section.slug } }),
  });

  const matchRedirect = (section: LinkedArchiveTreeNode) => isEqual(formatSection(section));
  const matchSection = (section: LinkedArchiveTreeNode) => (node: LinkedArchiveTreeNode) => section.id === node.id;

  let countNewRedirections = 0;
  for (const section of flatCurrentTree) {
    const { slug } = flatNewTree.find(matchSection(section)) || {};

    if (
      (slug && slug !== section.slug)
      && !redirects.find(matchRedirect(section))
    ) {
      redirects.push(formatSection(section));
      countNewRedirections++;
    }
  }

  fs.writeFileSync(redirectsBookPath, JSON.stringify(redirects, undefined, 2) + '\n', 'utf8');

  return countNewRedirections;
};

export default updateRedirectsData;
