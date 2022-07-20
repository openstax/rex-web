import fs from 'fs';
import path from 'path';
import { RedirectsData } from '../../data/redirects/types';
import { messageQueryParameterName } from '../../src/app/content/constants';
import { content } from '../../src/app/content/routes';
import { ArchiveTreeNode, BookWithOSWebData, LinkedArchiveTreeNode } from '../../src/app/content/types';
import { flattenArchiveTree, stripIdVersion } from '../../src/app/content/utils';
import {
  archiveTreeSectionIsPage,
  disableArchiveTreeCaching,
  findArchiveTreeNodeById,
  findDefaultBookPage
} from '../../src/app/content/utils/archiveTreeUtils';
import { CANONICAL_MAP } from '../../src/canonicalBookMap';
disableArchiveTreeCaching();

const redirectsPath = path.resolve(__dirname, '../../data/redirects/');

const updateRedirectsData = async(
    currentBook: BookWithOSWebData,
    newBook: BookWithOSWebData,
    allowBookRedirect?: boolean
  ) => {
  const booksAreDifferent = currentBook.id !== newBook.id;
  if (booksAreDifferent && !allowBookRedirect) {
    throw new Error(
      `updateRedirects requires two instances of the same book, `
      + `but you've passed ${currentBook.id} and ${newBook.id}`);
  }
  const redirectsBookPath = path.resolve(redirectsPath, currentBook.id + '.json');
  const redirects: RedirectsData = fs.existsSync(redirectsBookPath) ? await import(redirectsBookPath) : [];

  const flatCurrentTree = flattenArchiveTree(currentBook.tree).filter((section) => section.id !== currentBook.id);
  const currentSections = flatCurrentTree.filter(archiveTreeSectionIsPage);
  const flatNewTree = flattenArchiveTree(newBook.tree).filter((section) => section.id !== newBook.id);

  const matchSlug = (currentPageSlug: string) => flatNewTree.find((newPage) => newPage.slug === currentPageSlug);
  const matchRedirect = (section: LinkedArchiveTreeNode | ArchiveTreeNode) => (redirect: {pathname: string}) =>
    redirect.pathname === formatRedirectSource(section);
  const matchSection = (section: LinkedArchiveTreeNode) => (node: LinkedArchiveTreeNode) => section.id === node.id;

  const allowedDeletions: Array<{id: string, slug: string}> = [];

  const isAllowedDeletion = (section: LinkedArchiveTreeNode) =>
    allowedDeletions.find((allowed) => allowed.id === section.id && allowed.slug === section.slug);

  const formatRedirectSource = (section: LinkedArchiveTreeNode | ArchiveTreeNode) => decodeURI(
    content.getUrl({ book: { slug: currentBook.slug }, page: { slug: section.slug } })
  );

  const formatRedirect = (section: LinkedArchiveTreeNode | ArchiveTreeNode, newSection: ArchiveTreeNode) => ({
    bookId: newBook.id,
    pageId: stripIdVersion(newSection.id),
    pathname: formatRedirectSource(section),
    ...(booksAreDifferent && {query: `?${messageQueryParameterName}=retired`}),
  });

  const getRedirectTargetSection = (
    section: LinkedArchiveTreeNode
  ) => {
    const newSection = flatNewTree.find(matchSection(section));
    if (newSection && newSection.slug !== section.slug && !redirects.find(matchRedirect(section))) {
      return newSection;
    // remove `else` to enable legitimately removing pages from books
    // only once uuids are guaranteed to be consistent
    } else if (!newSection && matchSlug(section.slug) === undefined && !isAllowedDeletion && !booksAreDifferent) {
      throw new Error(
        `updateRedirects prohibits removing pages from a book, `
        + `but neither section with ID ${section.id} nor slug ${section.slug} was found in book ${newBook.id}`);
    // below condition is specific to retiring books
    } else if (booksAreDifferent && !isAllowedDeletion && !redirects.find(matchRedirect(section))) {
      // first check for a canonical page
      const canonicalPageMap = CANONICAL_MAP[currentBook.id]?.find((pageMap) => pageMap[0] === newBook.id) || [];
      const canonicalPageId = canonicalPageMap[1] && canonicalPageMap[1][section.id];
      // fall back to default book page
      return (canonicalPageId && findArchiveTreeNodeById(newBook.tree, canonicalPageId))
        || findDefaultBookPage(newBook);
    }
  };

  let countNewRedirections = 0;
  for (const section of currentSections) {
    const redirectTarget = getRedirectTargetSection(section);

    if (redirectTarget) {
      if (redirects.find(matchRedirect(redirectTarget))) {
        throw new Error(
          `updateRedirects found a circular redirect between sections with slugs ${
          section.slug} and ${redirectTarget.slug} in book ${newBook.id}`
        );
      }
      redirects.push(formatRedirect(section, redirectTarget));
      countNewRedirections++;
    }
  }

  if (redirects.length > 0) {
    fs.writeFileSync(redirectsBookPath, JSON.stringify(redirects, undefined, 2) + '\n', 'utf8');
  }

  return countNewRedirections;
};

export default updateRedirectsData;
