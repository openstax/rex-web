export const mockCmsBookFields = {
  authors: [{value: {name: 'Bam Bammerson'}}],
  cnx_id: '3',
  meta: {
    slug: 'book-slug-1',
  },
  publish_date: '2012-06-21',
};

export interface OSWebBook {
  meta: {
    slug: string;
  };
  publish_date: string;
  authors: Array<{
    value: {
      name: string;
    }
  }>;
  cnx_id: string;
}

export const mockCmsBook = {
  authors: mockCmsBookFields.authors,
  id: mockCmsBookFields.cnx_id,
  meta: {
    slug: mockCmsBookFields.meta.slug,
  },
  publish_date: mockCmsBookFields.publish_date,
};

export default () => ({
  getBookFromId: jest.fn(() => Promise.resolve(mockCmsBook)),
  getBookFromSlug: jest.fn(() => Promise.resolve(mockCmsBook)),
  getBookIdFromSlug: jest.fn(() => Promise.resolve('testbook1-uuid')),
  getBookSlugFromId: jest.fn(() => Promise.resolve('book-slug-1')),
});
