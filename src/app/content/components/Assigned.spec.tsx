import React from 'react';
import { RawIntlProvider } from 'react-intl';
import { Provider } from 'react-redux';
import renderer from 'react-test-renderer';
import createTestServices from '../../../test/createTestServices';
import createTestStore from '../../../test/createTestStore';
import { book, page, shortPage } from '../../../test/mocks/archiveLoader';
import { mockCmsBook } from '../../../test/mocks/osWebLoader';
import * as Services from '../../context/Services';
import createIntl from '../../messages/createIntl';
import * as selectNavigation from '../../navigation/selectors';
import { MiddlewareAPI, Store } from '../../types';
import { setTextSize } from '../actions';
import * as selectContent from '../selectors';
import { formatBookData } from '../utils';
import Assigned from './Assigned';
import { PrevNextBar } from './PrevNextBar';

describe('Assigned', () => {
  let store: Store;
  let services: ReturnType<typeof createTestServices> & MiddlewareAPI;

  beforeEach(() => {
    store = createTestStore();
    services = {
      ...createTestServices(),
      dispatch: store.dispatch,
      getState: store.getState,
    };

    store.dispatch(setTextSize(0));
  });

  it('renders loading state without book', async () => {
    jest.spyOn(selectNavigation, 'query').mockReturnValue({
      section: [page.id, shortPage.id],
    });

    const intl = await createIntl(book.language);

    const tree = renderer.create(
      <Provider store={store}>
        <RawIntlProvider value={intl}>
          <Services.Provider value={services}>
            <Assigned />
          </Services.Provider>
        </RawIntlProvider>
      </Provider>
    );

    expect(() =>
      tree.root.findByProps({
        'data-testid': 'loader',
      })
    ).not.toThrow();

    tree.unmount();
  });

  it('renders loading state without page', async () => {
    jest.spyOn(selectNavigation, 'query').mockReturnValue({
      section: [page.id, shortPage.id],
    });
    jest
      .spyOn(selectContent, 'book')
      .mockReturnValue(formatBookData(book, mockCmsBook));

    const intl = await createIntl(book.language);

    const tree = renderer.create(
      <Provider store={store}>
        <RawIntlProvider value={intl}>
          <Services.Provider value={services}>
            <Assigned />
          </Services.Provider>
        </RawIntlProvider>
      </Provider>
    );

    expect(() =>
      tree.root.findByProps({
        'data-testid': 'loader',
      })
    ).not.toThrow();

    tree.unmount();
  });

  it('renders with next link', async () => {
    jest.spyOn(selectNavigation, 'query').mockReturnValue({
      section: [page.id, shortPage.id],
    });
    jest
      .spyOn(selectContent, 'book')
      .mockReturnValue(formatBookData(book, mockCmsBook));

    const intl = await createIntl(book.language);

    const tree = renderer.create(
      <Provider store={store}>
        <RawIntlProvider value={intl}>
          <Services.Provider value={services}>
            <Assigned />
          </Services.Provider>
        </RawIntlProvider>
      </Provider>
    );

    await renderer.act(async () => {
      await services.promiseCollector.calm();
    });

    expect(() =>
      tree.root.findByProps({
        'aria-label': 'Next Page',
        'href': 'books/book-slug-1/pages/3-test-page-4',
      })
    ).not.toThrow();

    tree.unmount();
  });

  it('goes to next', async () => {
    jest.spyOn(selectNavigation, 'query').mockReturnValue({
      return_url: '/cool/redirect',
      section: [page.id, shortPage.id],
    });
    jest.spyOn(selectContent, 'book')
      .mockReturnValue(formatBookData(book, mockCmsBook));

    const intl = await createIntl(book.language);

    const tree = renderer.create(
      <Provider store={store}>
        <RawIntlProvider value={intl}>
          <Services.Provider value={services}>
            <Assigned />
          </Services.Provider>
        </RawIntlProvider>
      </Provider>
    );

    await renderer.act(async () => {
      await services.promiseCollector.calm();
    });

    const initialPageContent = tree.root.findByProps({ id: 'main-content' })
      .props.dangerouslySetInnerHTML.__html;

    expect(() => tree.root.findByProps({ href: '/cool/redirect' })).toThrow();

    await renderer.act(async () => {
      tree.root
        .findByProps({
          'aria-label': 'Next Page',
          'href': 'books/book-slug-1/pages/3-test-page-4',
        })
        .props.onClick({ preventDefault: jest.fn(), stopPropagation: jest.fn() });

      await services.promiseCollector.calm();
    });

    expect(
      tree.root.findByProps({ id: 'main-content' }).props.dangerouslySetInnerHTML.__html
    ).not.toBe(initialPageContent);

    expect(() => tree.root.findByProps({
      'aria-label': 'Next Page',
      'href': 'books/book-slug-1/pages/3-test-page-4',
    })).toThrow();

    expect(() => tree.root.findByProps({
      'aria-label': 'Previous Page',
      'href': 'books/book-slug-1/pages/test-page-1',
    })).not.toThrow();

    expect(() => tree.root.findByProps({
      href: '/cool/redirect',
    })).not.toThrow();

    tree.unmount();
  });

  it('goes to previous', async () => {
    jest.spyOn(selectNavigation, 'query').mockReturnValue({
      section: [page.id, shortPage.id],
    });
    jest.spyOn(selectContent, 'book')
      .mockReturnValue(formatBookData(book, mockCmsBook));

    const intl = await createIntl(book.language);

    const tree = renderer.create(
      <Provider store={store}>
        <RawIntlProvider value={intl}>
          <Services.Provider value={services}>
            <Assigned />
          </Services.Provider>
        </RawIntlProvider>
      </Provider>
    );

    await renderer.act(async () => {
      await services.promiseCollector.calm();
    });

    await renderer.act(async () => {
      tree.root
        .findByProps({
          'aria-label': 'Next Page',
          'href': 'books/book-slug-1/pages/3-test-page-4',
        })
        .props.onClick({ preventDefault: jest.fn(), stopPropagation: jest.fn() });

      await services.promiseCollector.calm();
    });

    const initialPageContent = tree.root.findByProps({ id: 'main-content' })
      .props.dangerouslySetInnerHTML.__html;

    await renderer.act(async () => {
      tree.root
        .findByProps({
          'aria-label': 'Previous Page',
          'href': 'books/book-slug-1/pages/test-page-1',
        })
        .props.onClick({ preventDefault: jest.fn(), stopPropagation: jest.fn() });

      await services.promiseCollector.calm();
    });

    expect(
      tree.root.findByProps({ id: 'main-content' }).props.dangerouslySetInnerHTML.__html
    ).not.toBe(initialPageContent);

    expect(() => tree.root.findByProps({
      'aria-label': 'Next Page',
      'href': 'books/book-slug-1/pages/3-test-page-4',
    })).not.toThrow();

    expect(() => tree.root.findByProps({
      'aria-label': 'Previous Page',
      'href': 'books/book-slug-1/pages/test-page-1',
    })).toThrow();

    tree.unmount();
  });

  it('renders correctly with a single section (string query)', async () => {
    // This covers query.section NOT being an array (line 72)
    // AND prevNext being undefined (line 96-98)
    jest.spyOn(selectNavigation, 'query').mockReturnValue({
      section: page.id,
    });
    jest.spyOn(selectContent, 'book')
      .mockReturnValue(formatBookData(book, mockCmsBook));

    const intl = await createIntl(book.language);

    const tree = renderer.create(
      <Provider store={store}>
        <RawIntlProvider value={intl}>
          <Services.Provider value={services}>
            <Assigned />
          </Services.Provider>
        </RawIntlProvider>
      </Provider>
    );

    await renderer.act(async () => {
      await services.promiseCollector.calm();
    });

    // Should NOT have PrevNextBar
    const prevNextBar = tree.root.findAllByType(PrevNextBar);
    expect(prevNextBar.length).toBe(0);

    tree.unmount();
  });
});
