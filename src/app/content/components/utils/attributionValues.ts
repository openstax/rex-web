import { Book } from '../../types';

// date is initialized as UTC, conversion to local time can change the date.
// this compensates
export function compensateForUTC(date: Date): void {
  date.setMinutes(date.getMinutes() + date.getTimezoneOffset());
}

export function getPublishDate(book: Book): Date | null {
  if (!('publish_date' in book)) {
    return null;
  }
  const date = new Date(book.publish_date);

  compensateForUTC(date);
  return date;
}

export function getAuthors(book: Book) {
  if (!('authors' in book)) {
    return [];
  }
  const seniorAuthors = book.authors.filter(
    author => author.value.senior_author
  );

  return seniorAuthors.length > 0 ? seniorAuthors : book.authors.slice(0, 2);
}

export const bookIdsWithSpecialAttributionText: {
  [key: string]: {
    copyrightHolder?: string;
    originalMaterialLink?: null | string;
  };
} = {
  '1b4ee0ce-ee89-44fa-a5e7-a0db9f0c94b1': {
    copyrightHolder: 'The Michelson 20MM Foundation',
  },
  '394a1101-fd8f-4875-84fa-55f15b06ba66': {
    copyrightHolder: 'Texas Education Agency (TEA)',
    originalMaterialLink: 'https://www.texasgateway.org/book/tea-statistics',
  },
  'cce64fde-f448-43b8-ae88-27705cceb0da': {
    copyrightHolder: 'Texas Education Agency (TEA)',
    originalMaterialLink: 'https://www.texasgateway.org/book/tea-physics',
  },
};

export function attributionValues(book: Book) {
  const bookPublishDate = getPublishDate(book);
  const authorsToDisplay = getAuthors(book);
  const locale = book.language;

  return {
    bookTitle: book.title,
    publisher: locale === 'pl' ? 'OpenStax Poland' : 'OpenStax',
    language: new Intl.DisplayNames([locale], { type: 'language' }).of(locale) as string,
    bookPublishDate,
    authorsToDisplay,
  };
}
