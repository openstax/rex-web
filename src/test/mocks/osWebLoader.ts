export default () => ({
  getBookIdFromSlug: jest.fn(() => Promise.resolve('testbook1-uuid')),
  getBookSlugFromId: jest.fn(() => Promise.resolve('book-slug-1')),
});
