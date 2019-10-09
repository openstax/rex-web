import { Highlight, SerializedHighlight } from '@openstax/highlighter';
import { Book, Page } from '../app/content/types';
import { isDefined } from '../app/guards';
import { assertWindow } from '../app/utils';

const HIGHLIGHT_KEY = 'highlights';

interface Stub {
  [book: string]: undefined | {
    [page: string]: undefined | {
      [highlightId: string]: undefined | SerializedHighlight['data']
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
    createHighlight: (book: Pick<Book, 'id'>, page: Pick<Page, 'id'>, highlight: Highlight) =>
      new Promise((resolve) => {
        const {pageHighlights, data} = getPageHighlight(book, page);

        pageHighlights[highlight.id] = highlight.serialize().data;

        saveStubData(data);

        resolve();
      }),
    deleteHighlight: (book: Pick<Book, 'id'>, page: Pick<Page, 'id'>, highlight: Highlight) =>
      new Promise((resolve) => {
        const {pageHighlights, data} = getPageHighlight(book, page);

        delete pageHighlights[highlight.id];

        saveStubData(data);

        resolve();
      }),
    getHighlightsByPage: (book: Pick<Book, 'id'>, page: Pick<Page, 'id'>) =>
      new Promise<SerializedHighlight[]>((resolve) => {
        resolve(
          Object.values(getPageHighlight(book, page).pageHighlights)
            .filter(isDefined)
            .map((data) => new SerializedHighlight(data))
        );
      }),
  };
};
