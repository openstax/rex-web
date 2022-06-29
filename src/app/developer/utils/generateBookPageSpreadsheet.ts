import { IntlShape } from 'react-intl';
import { ARCHIVE_URL, REACT_APP_OS_WEB_API_URL } from '../../../config';
import createArchiveLoader from '../../../gateways/createArchiveLoader';
import { getArchiveUrl } from '../../../gateways/createBookConfigLoader';
import createOSWebLoader from '../../../gateways/createOSWebLoader';
import { content as contentRoute } from '../../content/routes';
import { ArchiveBook, LinkedArchiveTree, LinkedArchiveTreeSection } from '../../content/types';
import {
  archiveTreeSectionIsChapter,
  archiveTreeSectionIsUnit,
  findTreePages,
} from '../../content/utils/archiveTreeUtils';
import { getCanonicalUrlParams } from '../../content/utils/canonicalUrl';
import { getParentPrefix } from '../../content/utils/seoUtils';
import { getBookPageUrlAndParams } from '../../content/utils/urlUtils';

const domParser = new DOMParser();

const stripTags = (value?: string) => value ? domParser.parseFromString(
  value, 'text/html').body.textContent.replace(/[\n ]+/g, ' ') : '';

const csvQuote = (value?: string) => value ? `"${value.replace(/"/g, '""')}"` : '""';

const getPageRow = (book: ArchiveBook, intl: IntlShape) => {
  const archiveLoader = createArchiveLoader(getArchiveUrl, {
    archivePrefix: ARCHIVE_URL,
  });
  const osWebLoader = createOSWebLoader(`${ARCHIVE_URL}${REACT_APP_OS_WEB_API_URL}`);

  return async(section: LinkedArchiveTreeSection | LinkedArchiveTree) => {
    const parentPrefix = getParentPrefix(section.parent, intl).trim();

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

export const generateBookPageSpreadsheet = async(book: ArchiveBook, intl: IntlShape) => [
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
  ...(await Promise.all(findTreePages(book.tree).map(getPageRow(book, intl)))),
].join(`\n`);
