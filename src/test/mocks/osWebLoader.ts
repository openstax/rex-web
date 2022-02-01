import { OSWebBook } from '../../gateways/createOSWebLoader';

export const mockCmsBook: OSWebBook = {
  amazon_link: '',
  authors: [{value: {name: 'Bam Bammerson', senior_author: true}}],
  book_state: 'live',
  cnx_id: '3',
  cover_color: 'blue',
  meta: {
    slug: 'book-slug-1',
  },
  promote_image: null,
  publish_date: '2012-06-21',
};

export default () => ({
  getBookFromId: jest.fn(() => Promise.resolve(mockCmsBook)),
  getBookFromSlug: jest.fn(() => Promise.resolve(mockCmsBook)),
  getBookIdFromSlug: jest.fn(() => Promise.resolve('testbook1-uuid')),
  getBookSlugFromId: jest.fn(() => Promise.resolve('book-slug-1')),
  preloadCache: jest.fn(),
});
