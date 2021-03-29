import fs from 'fs';
import { isEqual } from 'lodash/fp';
import path from 'path';
import { RedirectsData } from '../../data/redirects/types';
import { content } from '../../src/app/content/routes';
import { BookWithOSWebData, LinkedArchiveTreeNode } from '../../src/app/content/types';
import { flattenArchiveTree } from '../../src/app/content/utils';
import { CACHED_FLATTENED_TREES, findArchiveTreeNodeById } from '../../src/app/content/utils/archiveTreeUtils';

const redirectsPath = path.resolve(__dirname, '../../data/redirects/');

const updateRedirectsData = async(currentBook: BookWithOSWebData, newBook: BookWithOSWebData) => {
  if (currentBook.id !== newBook.id) {
    throw new Error(
      `updateRedirects requires two instances of the same book, `
      + `but you've passed ${currentBook.id} and ${newBook.id}`);
  }
  const redirectsBookPath = path.resolve(redirectsPath, currentBook.id + '.json');
  const redirects: RedirectsData = fs.existsSync(redirectsBookPath) ? await import(redirectsBookPath) : [];

  const flatCurrentTree = flattenArchiveTree(currentBook.tree);

  const formatSection = (section: LinkedArchiveTreeNode) => ({
    bookId: currentBook.id,
    pageId: section.id,
    pathname: content.getUrl({ book: { slug: currentBook.slug }, page: { slug: section.slug } }),
  });

  const matchRedirect = (section: LinkedArchiveTreeNode) => isEqual(formatSection(section));

  let countNewRedirections = 0;
  for (const section of flatCurrentTree) {
    const { slug } = findArchiveTreeNodeById(newBook.tree, section.id) || {};
    // findArchiveTreeNodeById will cache book structure and we don't want this
    // because we are comparing the same book with different version which may have different content
    CACHED_FLATTENED_TREES.clear();

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
