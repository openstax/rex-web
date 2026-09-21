import { Book } from '../../types';
import { shouldPolyfill } from '@formatjs/intl-displaynames/should-polyfill';

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
  '4eaa8f03-88a8-485a-a777-dd3602f6c13e': {
    copyrightHolder: 'OpenStax Poland',
  }, 
  '16ab5b96-4598-45f9-993c-b8d78d82b0c6': {
    copyrightHolder: 'OpenStax Poland',
  },
  'bb62933e-f20a-4ffc-90aa-97b36c296c3e': {
    copyrightHolder: 'OpenStax Poland',
  },
  '728df0bb-e07f-489d-91e3-4734a5932f92': {
    copyrightHolder: 'OpenStax Poland',
  },
  'c9cbc0aa-3afa-448b-8048-3ca2e0ee2f6a': {
    copyrightHolder: 'OpenStax Poland',
  },
  '823ae3e1-57c4-44c5-b54a-310091040cf6': {
    copyrightHolder: 'OpenStax Poland',
  },
  '834a50e2-a7ad-4f31-872e-16807cfe4f44': {
    copyrightHolder: 'OpenStax Poland',
  },
  '86922e8e-fc18-4fa6-af62-0e0e2e0f8df0': {
    copyrightHolder: 'OpenStax Poland',
  },
};

export function attributionValues(book: Book) {
  const bookPublishDate = getPublishDate(book);
  const authorsToDisplay = getAuthors(book);
  const locale = book.language;

  return {
    bookTitle: book.title,
    publisher: locale === 'pl' ? 'OpenStax Poland' : 'OpenStax',
    language: shouldPolyfill() ?
      locale :
      new Intl.DisplayNames([locale], { type: 'language' }).of(locale) as string,
    bookPublishDate,
    authorsToDisplay,
  };
}
