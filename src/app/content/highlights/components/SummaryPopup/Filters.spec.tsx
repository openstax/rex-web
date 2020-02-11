import { HighlightColorEnum } from '@openstax/highlighter/dist/api';
import React from 'react';
import { Provider } from 'react-redux';
import renderer from 'react-test-renderer';
import createTestServices from '../../../../../test/createTestServices';
import createTestStore from '../../../../../test/createTestStore';
import { book as archiveBook, pageInChapter } from '../../../../../test/mocks/archiveLoader';
import { mockCmsBook } from '../../../../../test/mocks/osWebLoader';
import MessageProvider from '../../../../MessageProvider';
import { MiddlewareAPI, Store } from '../../../../types';
import { assertDefined } from '../../../../utils';
import { receiveBook, receivePage } from '../../../actions';
import { formatBookData } from '../../../utils';
import { findArchiveTreeNode } from '../../../utils/archiveTreeUtils';
import { stripIdVersion } from '../../../utils/idUtils';
import { receiveHighlightsTotalCounts, setSummaryFilters } from '../../actions';
import { printSummaryHighlights } from '../../actions';
import Filters from './Filters';
import { FiltersListChapter, FiltersListColor, StyledPlainButton } from './FiltersList';

jest.mock('./ColorFilter', () => (props: any) => <div mock-color-filter {...props} />);
jest.mock('./ChapterFilter', () => (props: any) => <div mock-chapter-filter {...props} />);

describe('Filters', () => {
  let store: Store;
  const book = formatBookData(archiveBook, mockCmsBook);
  let helpers: ReturnType<typeof createTestServices> & MiddlewareAPI;
  let dispatch: jest.SpyInstance;
  let storeDispatch: jest.SpyInstance;

  beforeEach(() => {
    store = createTestStore();

    helpers = {
      ...createTestServices(),
      dispatch: store.dispatch,
      getState: store.getState,
    };

    dispatch = jest.spyOn(helpers, 'dispatch');
    storeDispatch = jest.spyOn(store, 'dispatch');
  });

  it('matches snapshot', () => {
    const component = renderer.create(<Provider store={store}>
      <MessageProvider>
        <Filters />
      </MessageProvider>
    </Provider>);

    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('updates on summary filters change', () => {
    store.dispatch(receiveBook(book));

    const component = renderer.create(<Provider store={store}>
      <MessageProvider>
        <Filters />
      </MessageProvider>
    </Provider>);

    let chapterFilters = component.root.findAllByType(FiltersListChapter);
    let colorFilters = component.root.findAllByType(FiltersListColor);

    expect(chapterFilters.length).toEqual(0);
    expect(colorFilters.length).toEqual(5);

    const pageId = stripIdVersion(book.tree.contents[0].id);
    const chapterId = stripIdVersion(book.tree.contents[1].id);
    renderer.act(() => {
      store.dispatch(setSummaryFilters({
        colors: [HighlightColorEnum.Blue, HighlightColorEnum.Yellow],
        locationIds: [pageId, chapterId],
      }));
    });

    chapterFilters = component.root.findAllByType(FiltersListChapter);
    colorFilters = component.root.findAllByType(FiltersListColor);

    expect(chapterFilters.length).toEqual(2);
    expect(chapterFilters[0].props.locationId).toEqual(pageId);
    expect(chapterFilters[1].props.locationId).toEqual(chapterId);
    expect(colorFilters.length).toEqual(2);
    expect(colorFilters[0].props.color).toEqual(HighlightColorEnum.Blue);
    expect(colorFilters[1].props.color).toEqual(HighlightColorEnum.Yellow);
  });

  it('dispatches action to print highlights', () => {
    const component = renderer.create(<Provider store={store}>
      <MessageProvider>
        <Filters />
      </MessageProvider>
    </Provider>);

    const renderedPrintButton = component.root.findByProps({'data-testid': 'hl-print-button'});

    renderer.act(() => {
      renderedPrintButton.props.onClick();
    });

    expect(storeDispatch).toHaveBeenCalledWith(printSummaryHighlights());
  });

  it('removes colors and chapters from filters on click', () => {
    store.dispatch(receiveBook(book));
    store.dispatch(receivePage({...pageInChapter, references: []}));
    store.dispatch(receiveHighlightsTotalCounts({
      'testbook1-testchapter5-uuid': {
        [HighlightColorEnum.Green]: 1,
        [HighlightColorEnum.Blue]: 1,
      },
    }, new Map([[
      'testbook1-testchapter5-uuid',
      assertDefined(findArchiveTreeNode(book.tree, 'testbook1-testchapter5-uuid'), ''),
    ]])));

    dispatch.mockClear();
    storeDispatch.mockClear();

    const component = renderer.create(<Provider store={store}>
      <MessageProvider>
        <Filters />
      </MessageProvider>
    </Provider>);

    let chapterFilters = component.root.findAllByType(FiltersListChapter);
    let colorFilters = component.root.findAllByType(FiltersListColor);

    expect(chapterFilters.length).toEqual(1);
    expect(colorFilters.length).toEqual(2);

    renderer.act(() => {
      chapterFilters[0].findByType(StyledPlainButton).props.onClick();
    });

    expect(storeDispatch).toBeCalledWith(setSummaryFilters({
      locationIds: [],
    }));

    renderer.act(() => {
      colorFilters[0].findByType(StyledPlainButton).props.onClick();
    });

    expect(storeDispatch).toBeCalledWith(setSummaryFilters({
      colors: [ HighlightColorEnum.Green ],
    }));

    chapterFilters = component.root.findAllByType(FiltersListChapter);
    colorFilters = component.root.findAllByType(FiltersListColor);

    expect(chapterFilters.length).toEqual(0);
    expect(colorFilters.length).toEqual(1);
  });
});
