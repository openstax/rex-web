export const mockCmsBookFields = {
  authors: [{value: {name: 'Bam Bammerson'}}],
  id: 3,
  publish_date: '2012-06-21',
  slug: 'book-slug-1',
};

export const mockCmsBook = {
  authors: mockCmsBookFields.authors,
  id: mockCmsBookFields.id,
  meta: {
    slug: mockCmsBookFields.slug,
  },
  publish_date: mockCmsBookFields.publish_date,
};

export default () => ({
  getBookFromId: jest.fn(() => Promise.resolve(mockCmsBook)),
  getBookFromSlug: jest.fn(() => Promise.resolve(mockCmsBook)),
  getBookIdFromSlug: jest.fn(() => Promise.resolve('testbook1-uuid')),
  getBookSlugFromId: jest.fn(() => Promise.resolve('book-slug-1')),
});
