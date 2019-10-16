import { SerializedHighlight } from '@openstax/highlighter';
import { Book, Page } from '../app/content/types';
import { assertWindow } from '../app/utils';

const HIGHLIGHT_KEY = 'highlights';

interface Stub {
  [book: string]: undefined | {
    [page: string]: undefined | {
      [highlightId: string]: SerializedHighlight['data']
    }
  };
}

const getStubData = () => (JSON.parse(assertWindow().localStorage.getItem(HIGHLIGHT_KEY) || 'null') || {}) as Stub;
const saveStubData = (data: Stub) => assertWindow().localStorage.setItem(HIGHLIGHT_KEY, JSON.stringify(data));

const getPageHighlight = (book: Pick<Book, 'id'>, page: Pick<Page, 'id'>) => {
  const data = getStubData();

  const bookHighlights = data[book.id] = data[book.id] || {};
  const pageHighlights = bookHighlights[page.id] = bookHighlights[page.id] || {};

  return {pageHighlights, data};
};

export default () => {
  return {
    createHighlight: (book: Pick<Book, 'id'>, page: Pick<Page, 'id'>, highlight: SerializedHighlight['data']) =>
      new Promise((resolve) => {
        const {pageHighlights, data} = getPageHighlight(book, page);

        pageHighlights[highlight.id] = highlight;

        saveStubData(data);

        resolve();
      }),
    deleteHighlight: (book: Pick<Book, 'id'>, page: Pick<Page, 'id'>, id: string) =>
      new Promise((resolve) => {
        const {pageHighlights, data} = getPageHighlight(book, page);

        delete pageHighlights[id];

        saveStubData(data);

        resolve();
      }),
    getHighlightsByPage: (book: Pick<Book, 'id'>, page: Pick<Page, 'id'>) =>
      new Promise<Array<SerializedHighlight['data']>>((resolve) => {
        resolve(
          Object.values(getPageHighlight(book, page).pageHighlights)
        );
      }),
  };
};
