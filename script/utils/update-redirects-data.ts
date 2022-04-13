import fs from 'fs';
import { isEqual } from 'lodash/fp';
import path from 'path';
import { RedirectsData } from '../../data/redirects/types';
import { content } from '../../src/app/content/routes';
import { BookWithOSWebData, LinkedArchiveTreeNode } from '../../src/app/content/types';
import { flattenArchiveTree } from '../../src/app/content/utils';
import { disableArchiveTreeCaching } from '../../src/app/content/utils/archiveTreeUtils';

disableArchiveTreeCaching();

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
    pathname: decodeURI(
      content.getUrl({ book: { slug: currentBook.slug }, page: { slug: section.slug } })
    ),
  });

  const matchRedirect = (section: LinkedArchiveTreeNode) => isEqual(formatSection(section));
  const matchSection = (section: LinkedArchiveTreeNode) => (node: LinkedArchiveTreeNode) => section.id === node.id;

  const allowedDeletions = [
    {
      id: 'c96816d3-855a-59a3-b2eb-1628764de0ea',
      slug: 'chapter-11',
    },
  ];

  let countNewRedirections = 0;
  for (const section of flatCurrentTree) {
    const newSection = flatNewTree.find(matchSection(section));
    const matchSlug = (currentPageSlug: string) => flatNewTree.find((newPage) => newPage.slug === currentPageSlug);
    const matchException =
      allowedDeletions.find((allowed) => allowed.id === section.id && allowed.slug === section.slug);

    if (newSection && newSection.slug !== section.slug && !redirects.find(matchRedirect(section))) {
      if (redirects.find(matchRedirect(newSection))) {
        throw new Error(
          `updateRedirects found a circular redirect between sections with slugs ${
          section.slug} and ${newSection.slug} in book ${newBook.id}`
        );
      }

      redirects.push(formatSection(section));
      countNewRedirections++;
    // remove `else` to enable legitimately removing pages from books
    // only once uuids are guaranteed to be consistent
    } else if (!newSection && matchSlug(section.slug) === undefined && !matchException) {
      throw new Error(
        `updateRedirects prohibits removing pages from a book, `
        + `but neither section with ID ${section.id} nor slug ${section.slug} was found in book ${newBook.id}`);
    }
  }

  if (redirects.length > 0) {
    fs.writeFileSync(redirectsBookPath, JSON.stringify(redirects, undefined, 2) + '\n', 'utf8');
  }

  return countNewRedirections;
};

export default updateRedirectsData;
