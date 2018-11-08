import { content } from './routes';

describe('content route', () => {
  it('generates a url', () => {
    const url = content.getUrl({bookId: 'book', pageId: 'page'});
    expect(url).toEqual('/books/book/pages/page');
  });
});
