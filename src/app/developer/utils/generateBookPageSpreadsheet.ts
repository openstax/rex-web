import { content as contentRoute } from '../../content/routes';
import { Book, LinkedArchiveTree, LinkedArchiveTreeSection } from '../../content/types';
import {
  archiveTreeSectionIsChapter,
  archiveTreeSectionIsUnit,
  findTreePages,
} from '../../content/utils/archiveTreeUtils';
import { getCanonicalUrlParams } from '../../content/utils/canonicalUrl';
import { getParentPrefix } from '../../content/utils/seoUtils';
import { getBookPageUrlAndParams } from '../../content/utils/urlUtils';
import { AppServices } from '../../types';
import { assertNotNull } from '../../utils/assertions';

const domParser = new DOMParser();

const stripTags = (value?: string) => value ? domParser.parseFromString(
  value, 'text/html').body.textContent.replace(/[\n ]+/g, ' ') : '';

const csvQuote = (value?: string) => value ? `"${value.replace(/"/g, '""')}"` : '""';

const getPageRow = (book: Book, services: AppServices) => {
  const {archiveLoader, osWebLoader} = services;

  return async(section: LinkedArchiveTreeSection | LinkedArchiveTree) => {
    // TODO - this is actually wrong, since different books will want different intl
    const parentPrefix = getParentPrefix(section.parent, assertNotNull(services.intl.current, 'must have intl')).trim();

    const { url } = getBookPageUrlAndParams(book, section);

    const canonical = await getCanonicalUrlParams(archiveLoader, osWebLoader, book, section.id);
    const canonicalUrl = canonical && contentRoute.getUrl(canonical);

    const chapter = section.parent && archiveTreeSectionIsChapter(section.parent) ?
      section.parent : undefined;
    const unit = chapter ?
      (chapter.parent && archiveTreeSectionIsUnit(chapter.parent) ? chapter.parent : undefined) :
      (section.parent && archiveTreeSectionIsUnit(section.parent) ? section.parent : undefined);

    return [
      book.title,
      book.version,
      stripTags(unit?.title),
      stripTags(chapter?.title),
      parentPrefix,
      section.id,
      stripTags(section.title),
      section.slug,
      `https://openstax.org${url}`,
      canonicalUrl ? `https://openstax.org${canonicalUrl}` : '',
    ].map(csvQuote).join(',');
  };
};

export const generateBookPageSpreadsheet = async(book: Book, services: AppServices) => [
  [
    'Book Title',
    'Book Version',
    'Unit Title',
    'Chapter Title',
    'Parent Prefix',
    'Page UUID',
    'Page Title',
    'Page Slug',
    'Page URL',
    'Canonical URL',
  ].map(csvQuote).join(','),
  ...(await Promise.all(findTreePages(book.tree).map(getPageRow(book, services)))),
].join(`\n`);
