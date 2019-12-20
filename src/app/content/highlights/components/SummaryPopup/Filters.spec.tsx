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
import { receiveBook, receivePage } from '../../../actions';
import { formatBookData } from '../../../utils';
import { stripIdVersion } from '../../../utils/idUtils';
import { setSummaryFilters } from '../../actions';
import { highlightStyles } from '../../constants';
import { summaryFilters } from '../../selectors';
import { addCurrentPageToSummaryFilters } from '../../utils';
import Filters from './Filters';
import { FiltersListChapter, FiltersListColor, RemoveIcon } from './FiltersList';

jest.mock('./ColorFilter', () => (props: any) => <div mock-color-filter {...props} />);
jest.mock('./ChapterFilter', () => (props: any) => <div mock-chapter-filter {...props} />);

describe('Filters', () => {
  let store: Store;
  const book = formatBookData(archiveBook, mockCmsBook);
  let helpers: ReturnType<typeof createTestServices> & MiddlewareAPI;
  let dispatch: jest.SpyInstance;

  beforeEach(() => {
    store = createTestStore();

    helpers = {
      ...createTestServices(),
      dispatch: store.dispatch,
      getState: store.getState,
    };

    dispatch = jest.spyOn(helpers, 'dispatch');
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
    expect(chapterFilters[0].props.chapterId).toEqual(pageId);
    expect(chapterFilters[1].props.chapterId).toEqual(chapterId);
    expect(colorFilters.length).toEqual(2);
    expect(colorFilters[0].props.color).toEqual(HighlightColorEnum.Blue);
    expect(colorFilters[1].props.color).toEqual(HighlightColorEnum.Yellow);
  });

  it('removes colors and chapter on click from filter', () => {
    store.dispatch(receiveBook(book));
    store.dispatch(receivePage({...pageInChapter, references: []}));
    addCurrentPageToSummaryFilters(helpers);
    const filters = summaryFilters(store.getState());

    const component = renderer.create(<Provider store={store}>
      <MessageProvider>
        <Filters />
      </MessageProvider>
    </Provider>);

    let chapterFilters = component.root.findAllByType(FiltersListChapter);
    let colorFilters = component.root.findAllByType(FiltersListColor);

    expect(chapterFilters.length).toEqual(1);
    expect(colorFilters.length).toEqual(5);

    renderer.act(() => {
      chapterFilters[0].findByType(RemoveIcon).props.onClick();
      colorFilters[0].findByType(RemoveIcon).props.onClick();
    });

    const colors = highlightStyles.map(({label}) => label);
    expect(dispatch).toBeCalledTimes(3);
    expect(dispatch).toBeCalledWith(
      setSummaryFilters({
        colors,
        locationIds: ['testbook1-testchapter5-uuid'],
      }),
      setSummaryFilters({
        colors,
        locationIds: [],
      }),
      setSummaryFilters({
        colors: colors.slice(1, filters.colors.length),
        locationIds: [],
      })
    );

    chapterFilters = component.root.findAllByType(FiltersListChapter);
    colorFilters = component.root.findAllByType(FiltersListColor);

    expect(chapterFilters.length).toEqual(0);
    expect(colorFilters.length).toEqual(4);
  });
});
