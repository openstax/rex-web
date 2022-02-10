// tslint:disable: max-line-length
import createIntl from '../../../../src/test/createIntl';
import { book } from '../../../test/mocks/archiveLoader';
import { mockCmsBook } from '../../../test/mocks/osWebLoader';
import { formatBookData } from '../../content/utils';
import { generateBookPageSpreadsheet } from './generateBookPageSpreadsheet';

const combinedBook = {
  ...formatBookData(book, mockCmsBook),
  id: '3f6e0e03-46ac-485e-a737-ab3690d0b879',
};

describe('generateBookPageSpreadsheet', () => {
  it('works', () => {
    const intl = createIntl();
    expect(generateBookPageSpreadsheet(combinedBook, intl))
      .toMatchInlineSnapshot(`
      "\\"Test Book 1\\",\\"\\",\\"Test Page 1\\",\\"https://openstax.org/books/3f6e0e03-46ac-485e-a737-ab3690d0b879@1.0/pages/test-page-1\\"
      \\"Test Book 1\\",\\"Ch. 1\\",\\"Introduction to Science and the Realm of Physics, Physical Quantities, and Units\\",\\"https://openstax.org/books/3f6e0e03-46ac-485e-a737-ab3690d0b879@1.0/pages/1-introduction-to-science-and-the-realm-of-physics-physical-quantities-and-units\\"
      \\"Test Book 1\\",\\"Ch. 1\\",\\"1.1 Physics: An Introduction\\",\\"https://openstax.org/books/3f6e0e03-46ac-485e-a737-ab3690d0b879@1.0/pages/1-1-physics-an-introduction\\"
      \\"Test Book 1\\",\\"Ch. 1\\",\\"23.12 RLC Series AC Circuits\\",\\"https://openstax.org/books/3f6e0e03-46ac-485e-a737-ab3690d0b879@1.0/pages/23-12-rlc-series-ac-circuits\\"
      \\"Test Book 1\\",\\"Ch. 2\\",\\"Test Page 3\\",\\"https://openstax.org/books/3f6e0e03-46ac-485e-a737-ab3690d0b879@1.0/pages/2-test-page-3\\"
      \\"Test Book 1\\",\\"Ch. 3\\",\\"Test Page 4\\",\\"https://openstax.org/books/3f6e0e03-46ac-485e-a737-ab3690d0b879@1.0/pages/3-test-page-4\\"
      \\"Test Book 1\\",\\"Ch. 4\\",\\"Test Page 5\\",\\"https://openstax.org/books/3f6e0e03-46ac-485e-a737-ab3690d0b879@1.0/pages/4-test-page-5\\"
      \\"Test Book 1\\",\\"Ch. 10\\",\\"Test Page 6 with special characters in url\\",\\"https://openstax.org/books/3f6e0e03-46ac-485e-a737-ab3690d0b879@1.0/pages/10-test-page-6-f%C3%ADsica\\"
      \\"Test Book 1\\",\\"Ch. 12\\",\\"Test Page 7\\",\\"https://openstax.org/books/3f6e0e03-46ac-485e-a737-ab3690d0b879@1.0/pages/12-test-page-7\\"
      \\"Test Book 1\\",\\"\\",\\"A | Atomic Masses\\",\\"https://openstax.org/books/3f6e0e03-46ac-485e-a737-ab3690d0b879@1.0/pages/a-atomic-masses\\"
      \\"Test Book 1\\",\\"\\",\\"D | Glossary of Key Symbols and Notation\\",\\"https://openstax.org/books/3f6e0e03-46ac-485e-a737-ab3690d0b879@1.0/pages/d-glossary-of-key-symbols-and-notation\\"
      \\"Test Book 1\\",\\"\\",\\"Test Page for Generic Styles\\",\\"https://openstax.org/books/3f6e0e03-46ac-485e-a737-ab3690d0b879@1.0/pages/test-page-for-generic-styles\\""
    `);
  });
});
