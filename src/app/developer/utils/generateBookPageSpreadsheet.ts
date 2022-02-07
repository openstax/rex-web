import { IntlShape } from 'react-intl';
import { ArchiveBook, LinkedArchiveTree, LinkedArchiveTreeSection } from '../../content/types';
import { findTreePages } from '../../content/utils/archiveTreeUtils';
import { getParentPrefix } from '../../content/utils/seoUtils';
import { getBookPageUrlAndParams } from '../../content/utils/urlUtils';

const domParser = new DOMParser();

const getPageRow = (book: ArchiveBook, intl: IntlShape) => (section: LinkedArchiveTreeSection | LinkedArchiveTree) => {
  const sectionTitle = domParser.parseFromString(section.title, 'text/html').body.textContent;
  const parentPrefix = getParentPrefix(section.parent, intl).trim();

  const { url } = getBookPageUrlAndParams(book, section);

  return [
    book.title,
    parentPrefix,
    sectionTitle,
    `https://openstax.org${url}`,
  ]
    .map((col) => `"${col}"`)
    .join(',')
  ;
};

export const generateBookPageSpreadsheet = (book: ArchiveBook, intl: IntlShape) => findTreePages(book.tree)
  .map(getPageRow(book, intl))
  .join(`\n`)
;
