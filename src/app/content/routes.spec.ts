import { content } from './routes';

describe('content route', () => {
  it('generates a url', () => {
    const url = content.getUrl({book: 'book', page: 'page'});
    expect(url).toEqual('/books/book/pages/page');
  });
});
