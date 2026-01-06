import createTestServices from '../../../test/createTestServices';
import { book, bookWithUnits } from '../../../test/mocks/archiveLoader';
import { mockCmsBook } from '../../../test/mocks/osWebLoader';
import { formatBookData } from '../../content/utils';
import { generateBookPageSpreadsheet } from './generateBookPageSpreadsheet';

describe('generateBookPageSpreadsheet', () => {
  it('works with units and a canonical url map', async() => {
    const combinedBook = {
      ...formatBookData(bookWithUnits, mockCmsBook),
      id: '3f6e0e03-46ac-485e-a737-ab3690d0b879',
      loadOptions: {
        booksConfig: {
          archiveUrl: '/test/archive',
          books: {'3f6e0e03-46ac-485e-a737-ab3690d0b879': {defaultVersion: bookWithUnits.version}},
        },
      },
    };
    const services = createTestServices();
    expect(await generateBookPageSpreadsheet(combinedBook, services))
      .toMatchInlineSnapshot(`
      "\\"Book Title\\",\\"Book Version\\",\\"Unit Title\\",\\"Chapter Title\\",\\"Parent Prefix\\",\\"Page UUID\\",\\"Page Title\\",\\"Page Slug\\",\\"Page URL\\",\\"Canonical URL\\"
      \\"Test Book 1\\",\\"1.0\\",\\"\\",\\"\\",\\"\\",\\"testbook1-testpage1-uuid\\",\\"Test Page 1\\",\\"test-page-1\\",\\"https://openstax.org/books/book-slug-1/pages/test-page-1\\",\\"https://openstax.org/books/book-slug-1/pages/test-page-1\\"
      \\"Test Book 1\\",\\"1.0\\",\\"Test Unit 1\\",\\"\\",\\"Test Unit 1\\",\\"testbook1-testpage11-uuid\\",\\"1.1 Physics: An Introduction\\",\\"1-1-physics-an-introduction\\",\\"https://openstax.org/books/book-slug-1/pages/1-1-physics-an-introduction\\",\\"https://openstax.org/books/book-slug-1/pages/1-1-physics-an-introduction\\"
      \\"Test Book 1\\",\\"1.0\\",\\"Test Unit 1\\",\\"1 Test Chapter 1.1\\",\\"Ch. 1\\",\\"testbook1-testpage2-uuid\\",\\"Introduction to Science and the Realm of Physics, Physical Quantities, and Units\\",\\"1-introduction-to-science-and-the-realm-of-physics-physical-quantities-and-units\\",\\"https://openstax.org/books/book-slug-1/pages/1-introduction-to-science-and-the-realm-of-physics-physical-quantities-and-units\\",\\"https://openstax.org/books/book-slug-1/pages/1-introduction-to-science-and-the-realm-of-physics-physical-quantities-and-units\\"
      \\"Test Book 1\\",\\"1.0\\",\\"Test Unit 1\\",\\"1 Test Chapter 1.1\\",\\"Ch. 1\\",\\"testbook1-testpage8-uuid\\",\\"23.12 RLC Series AC Circuits\\",\\"23-12-rlc-series-ac-circuits\\",\\"https://openstax.org/books/book-slug-1/pages/23-12-rlc-series-ac-circuits\\",\\"https://openstax.org/books/book-slug-1/pages/23-12-rlc-series-ac-circuits\\"
      \\"Test Book 1\\",\\"1.0\\",\\"\\",\\"2 Test Chapter 2\\",\\"Ch. 2\\",\\"testbook1-testpage3-uuid\\",\\"Test Page 3\\",\\"2-test-page-3\\",\\"https://openstax.org/books/book-slug-1/pages/2-test-page-3\\",\\"https://openstax.org/books/book-slug-1/pages/2-test-page-3\\"
      \\"Test Book 1\\",\\"1.0\\",\\"\\",\\"3 Test Chapter 3\\",\\"Ch. 3\\",\\"testbook1-testpage4-uuid\\",\\"Test Page 4\\",\\"3-test-page-4\\",\\"https://openstax.org/books/book-slug-1/pages/3-test-page-4\\",\\"https://openstax.org/books/book-slug-1/pages/3-test-page-4\\"
      \\"Test Book 1\\",\\"1.0\\",\\"\\",\\"4 Test Chapter 4\\",\\"Ch. 4\\",\\"testbook1-testpage5-uuid\\",\\"Test Page 5\\",\\"4-test-page-5\\",\\"https://openstax.org/books/book-slug-1/pages/4-test-page-5\\",\\"https://openstax.org/books/book-slug-1/pages/4-test-page-5\\"
      \\"Test Book 1\\",\\"1.0\\",\\"\\",\\"10 Test Chapter 5\\",\\"Ch. 10\\",\\"testbook1-testpage6-uuid\\",\\"Test Page 6 with special characters in url\\",\\"10-test-page-6-física\\",\\"https://openstax.org/books/book-slug-1/pages/10-test-page-6-f%C3%ADsica\\",\\"https://openstax.org/books/book-slug-1/pages/10-test-page-6-f%C3%ADsica\\"
      \\"Test Book 1\\",\\"1.0\\",\\"\\",\\"12 Test Chapter 6\\",\\"Ch. 12\\",\\"testbook1-testpage7-uuid\\",\\"Test Page 7\\",\\"12-test-page-7\\",\\"https://openstax.org/books/book-slug-1/pages/12-test-page-7\\",\\"https://openstax.org/books/book-slug-1/pages/12-test-page-7\\"
      \\"Test Book 1\\",\\"1.0\\",\\"\\",\\"\\",\\"\\",\\"testbook1-testpage9-uuid\\",\\"A | Atomic Masses\\",\\"a-atomic-masses\\",\\"https://openstax.org/books/book-slug-1/pages/a-atomic-masses\\",\\"https://openstax.org/books/book-slug-1/pages/a-atomic-masses\\"
      \\"Test Book 1\\",\\"1.0\\",\\"\\",\\"\\",\\"\\",\\"testbook1-testpage10-uuid\\",\\"D | Glossary of Key Symbols and Notation\\",\\"d-glossary-of-key-symbols-and-notation\\",\\"https://openstax.org/books/book-slug-1/pages/d-glossary-of-key-symbols-and-notation\\",\\"https://openstax.org/books/book-slug-1/pages/d-glossary-of-key-symbols-and-notation\\"
      \\"Test Book 1\\",\\"1.0\\",\\"\\",\\"\\",\\"\\",\\"testbook1-testpage12-uuid\\",\\"Test Page for Generic Styles\\",\\"test-page-for-generic-styles\\",\\"https://openstax.org/books/book-slug-1/pages/test-page-for-generic-styles\\",\\"https://openstax.org/books/book-slug-1/pages/test-page-for-generic-styles\\""
    `);
  });

  it('works without units or a canonical url map', async() => {
    const combinedBook = {
      ...formatBookData(book, undefined),
      id: 'e0ae033d-c34b-4518-8872-906ceb0b25b7',
      loadOptions: {
        booksConfig: {
          archiveUrl: '/test/archive',
          books: {},
        },
      },
    };
    const services = createTestServices();
    expect(await generateBookPageSpreadsheet(combinedBook, services))
      .toMatchInlineSnapshot(`
      "\\"Book Title\\",\\"Book Version\\",\\"Unit Title\\",\\"Chapter Title\\",\\"Parent Prefix\\",\\"Page UUID\\",\\"Page Title\\",\\"Page Slug\\",\\"Page URL\\",\\"Canonical URL\\"
      \\"Test Book 1\\",\\"1.0\\",\\"\\",\\"\\",\\"\\",\\"testbook1-testpage1-uuid\\",\\"Test Page 1\\",\\"test-page-1\\",\\"https://openstax.org/books/e0ae033d-c34b-4518-8872-906ceb0b25b7@1.0/pages/test-page-1\\",\\"\\"
      \\"Test Book 1\\",\\"1.0\\",\\"\\",\\"1 Test Chapter 1.1\\",\\"Ch. 1\\",\\"testbook1-testpage2-uuid\\",\\"Introduction to Science and the Realm of Physics, Physical Quantities, and Units\\",\\"1-introduction-to-science-and-the-realm-of-physics-physical-quantities-and-units\\",\\"https://openstax.org/books/e0ae033d-c34b-4518-8872-906ceb0b25b7@1.0/pages/1-introduction-to-science-and-the-realm-of-physics-physical-quantities-and-units\\",\\"\\"
      \\"Test Book 1\\",\\"1.0\\",\\"\\",\\"1 Test Chapter 1\\",\\"Ch. 1\\",\\"testbook1-testpage11-uuid\\",\\"1.1 Physics: An Introduction\\",\\"1-1-physics-an-introduction\\",\\"https://openstax.org/books/e0ae033d-c34b-4518-8872-906ceb0b25b7@1.0/pages/1-1-physics-an-introduction\\",\\"\\"
      \\"Test Book 1\\",\\"1.0\\",\\"\\",\\"1 Test Chapter 1\\",\\"Ch. 1\\",\\"testbook1-testpage8-uuid\\",\\"23.12 RLC Series AC Circuits\\",\\"23-12-rlc-series-ac-circuits\\",\\"https://openstax.org/books/e0ae033d-c34b-4518-8872-906ceb0b25b7@1.0/pages/23-12-rlc-series-ac-circuits\\",\\"\\"
      \\"Test Book 1\\",\\"1.0\\",\\"\\",\\"2 Test Chapter 2\\",\\"Ch. 2\\",\\"testbook1-testpage3-uuid\\",\\"Test Page 3\\",\\"2-test-page-3\\",\\"https://openstax.org/books/e0ae033d-c34b-4518-8872-906ceb0b25b7@1.0/pages/2-test-page-3\\",\\"\\"
      \\"Test Book 1\\",\\"1.0\\",\\"\\",\\"3 Test Chapter 3\\",\\"Ch. 3\\",\\"testbook1-testpage4-uuid\\",\\"Test Page 4\\",\\"3-test-page-4\\",\\"https://openstax.org/books/e0ae033d-c34b-4518-8872-906ceb0b25b7@1.0/pages/3-test-page-4\\",\\"\\"
      \\"Test Book 1\\",\\"1.0\\",\\"\\",\\"4 Test Chapter 4\\",\\"Ch. 4\\",\\"testbook1-testpage5-uuid\\",\\"Test Page 5\\",\\"4-test-page-5\\",\\"https://openstax.org/books/e0ae033d-c34b-4518-8872-906ceb0b25b7@1.0/pages/4-test-page-5\\",\\"\\"
      \\"Test Book 1\\",\\"1.0\\",\\"\\",\\"10 Test Chapter 5\\",\\"Ch. 10\\",\\"testbook1-testpage6-uuid\\",\\"Test Page 6 with special characters in url\\",\\"10-test-page-6-física\\",\\"https://openstax.org/books/e0ae033d-c34b-4518-8872-906ceb0b25b7@1.0/pages/10-test-page-6-f%C3%ADsica\\",\\"\\"
      \\"Test Book 1\\",\\"1.0\\",\\"\\",\\"12 Test Chapter 6\\",\\"Ch. 12\\",\\"testbook1-testpage7-uuid\\",\\"Test Page 7\\",\\"12-test-page-7\\",\\"https://openstax.org/books/e0ae033d-c34b-4518-8872-906ceb0b25b7@1.0/pages/12-test-page-7\\",\\"\\"
      \\"Test Book 1\\",\\"1.0\\",\\"\\",\\"\\",\\"\\",\\"testbook1-testpage9-uuid\\",\\"A | Atomic Masses\\",\\"a-atomic-masses\\",\\"https://openstax.org/books/e0ae033d-c34b-4518-8872-906ceb0b25b7@1.0/pages/a-atomic-masses\\",\\"\\"
      \\"Test Book 1\\",\\"1.0\\",\\"\\",\\"\\",\\"\\",\\"testbook1-testpage10-uuid\\",\\"D | Glossary of Key Symbols and Notation\\",\\"d-glossary-of-key-symbols-and-notation\\",\\"https://openstax.org/books/e0ae033d-c34b-4518-8872-906ceb0b25b7@1.0/pages/d-glossary-of-key-symbols-and-notation\\",\\"\\"
      \\"Test Book 1\\",\\"1.0\\",\\"\\",\\"\\",\\"\\",\\"testbook1-testpage12-uuid\\",\\"Test Page for Generic Styles\\",\\"test-page-for-generic-styles\\",\\"https://openstax.org/books/e0ae033d-c34b-4518-8872-906ceb0b25b7@1.0/pages/test-page-for-generic-styles\\",\\"\\""
    `);
  });
});
