import * as highlighter from '@openstax/highlighter';
import { assertWindow } from '../app/utils';
import { book, page, shortPage } from '../test/mocks/archiveLoader';
import createHighlightClient from './createHighlightClient';

const fakeHighlight = (id: string) => ({
  id,
  serialize: () => ({data: id}),
}) as unknown as highlighter.Highlight;

class MockPlaceholder {
  public arg: any;

  constructor(arg: any) {
    this.arg = arg;
  }
}

describe('createHighlightClient', () => {
  let client: ReturnType<typeof createHighlightClient>;
  let getItem: jest.SpyInstance;
  let setItem: jest.SpyInstance;
  const window = assertWindow();
  const localStorage = window.localStorage;
  const SerializedHighlight = highlighter.SerializedHighlight;

  beforeEach(() => {
    client = createHighlightClient();

    getItem = jest.fn();
    setItem = jest.fn();

    Object.defineProperty(window, 'localStorage', {
      value: {getItem, setItem},
      writable: true,
    });

    (highlighter as any).SerializedHighlight = MockPlaceholder;
  });

  afterEach(() => {
    Object.defineProperty(window, 'localStorage', {
      value: localStorage,
      writable: true,
    });

    (highlighter as any).SerializedHighlight = SerializedHighlight;
  });

  describe('createHighlight', () => {
    it('works without initial data', async() => {
      getItem.mockReturnValue(null);
      await client.createHighlight(book, page, fakeHighlight('a'));

      expect(setItem).toHaveBeenCalledWith(expect.any(String), JSON.stringify({
        [book.id]: {
          [page.id]: {
            a:  'a',
          },
        },
      }));
    });

    it('adds additional highlights to a page', async() => {
      getItem.mockReturnValue(JSON.stringify({
        [book.id]: {
          [page.id]: {
            a:  'a',
          },
        },
      }));
      await client.createHighlight(book, page, fakeHighlight('b'));

      expect(setItem).toHaveBeenCalledWith(expect.any(String), JSON.stringify({
        [book.id]: {
          [page.id]: {
            a:  'a',
            b:  'b',
          },
        },
      }));
    });

    it('adds additional highlights to another page', async() => {
      getItem.mockReturnValue(JSON.stringify({
        [book.id]: {
          [page.id]: {
            a:  'a',
          },
        },
      }));
      await client.createHighlight(book, shortPage, fakeHighlight('b'));

      expect(setItem).toHaveBeenCalledWith(expect.any(String), JSON.stringify({
        [book.id]: {
          [page.id]: {
            a:  'a',
          },
          [shortPage.id]: {
            b:  'b',
          },
        },
      }));
    });
  });

  describe('deleteHighlight', () => {
    it('deletes highlight', async() => {
      getItem.mockReturnValue(JSON.stringify({
        [book.id]: {
          [page.id]: {
            a: 'a',
          },
        },
      }));
      await client.deleteHighlight(book, page, fakeHighlight('a'));
      expect(setItem).toHaveBeenCalledWith(expect.any(String), JSON.stringify({
        [book.id]: {
          [page.id]: {
          },
        },
      }));
    });

    it('noops without data', async() => {
      getItem.mockReturnValue(null);
      await client.deleteHighlight(book, page, fakeHighlight('a'));
      expect(setItem).toHaveBeenCalledWith(expect.any(String), JSON.stringify({
        [book.id]: {
          [page.id]: {
          },
        },
      }));
    });

    it('noops with  data', async() => {
      getItem.mockReturnValue(JSON.stringify({
        [book.id]: {
          [page.id]: {
          },
        },
      }));
      await client.deleteHighlight(book, page, fakeHighlight('a'));
      expect(setItem).toHaveBeenCalledWith(expect.any(String), JSON.stringify({
        [book.id]: {
          [page.id]: {
          },
        },
      }));
    });
  });

  describe('getHighlightsByPage', () => {
    it('gets empty list wihtout data', async() => {
      getItem.mockReturnValue(null);
      const highlights = await client.getHighlightsByPage(book, page);
      expect(highlights).toEqual([]);
    });

    it('gets highlights for page', async() => {
      getItem.mockReturnValue(JSON.stringify({
        [book.id]: {
          [page.id]: {
            a:  'a',
          },
          [shortPage.id]: {
            b:  'b',
          },
        },
      }));
      const highlights = await client.getHighlightsByPage(book, page);
      expect(highlights.length).toBe(1);
      expect((highlights[0] as any).arg).toEqual('a');
    });
  });
});
