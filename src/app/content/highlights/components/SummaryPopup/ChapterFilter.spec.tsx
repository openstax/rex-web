import React from 'react';
import { Provider } from 'react-redux';
import renderer from 'react-test-renderer';
import createTestServices from '../../../../../test/createTestServices';
import createTestStore from '../../../../../test/createTestStore';
import { book as archiveBook, page, shortPage } from '../../../../../test/mocks/archiveLoader';
import { mockCmsBook } from '../../../../../test/mocks/osWebLoader';
import AllOrNone from '../../../../components/AllOrNone';
import Checkbox from '../../../../components/Checkbox';
import MessageProvider from '../../../../MessageProvider';
import { MiddlewareAPI, Store } from '../../../../types';
import { receiveBook, receivePage } from '../../../actions';
import { formatBookData } from '../../../utils';
import { setHighlightsTotalCountsPerLocation } from '../../actions';
import { addCurrentPageToSummaryFilters } from '../../utils';
import ChapterFilter from './ChapterFilter';

describe('ChapterFilter', () => {
  const book = formatBookData(archiveBook, mockCmsBook);
  let store: Store;
  let helpers: ReturnType<typeof createTestServices> & MiddlewareAPI;

  beforeEach(() => {
    store = createTestStore();

    helpers = {
      ...createTestServices(),
      dispatch: store.dispatch,
      getState: store.getState,
    };

    store.dispatch(receivePage({...page, references: []}));
  });

  it('matches snapshot', () => {
    store.dispatch(receiveBook(book));
    store.dispatch(setHighlightsTotalCountsPerLocation({
      'testbook1-testpage1-uuid': 1,
    }));
    addCurrentPageToSummaryFilters(helpers);

    const component = renderer.create(<Provider store={store}>
      <MessageProvider>
        <ChapterFilter />
      </MessageProvider>
    </Provider>);

    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('renders without a book', () => {
    const component = renderer.create(<Provider store={store}>
      <MessageProvider>
        <ChapterFilter />
      </MessageProvider>
    </Provider>);

    const checkedBoxes = component.root.findAllByProps({checked: true});
    expect(checkedBoxes.length).toBe(0);
  });

  it('initially has the selected page checked', () => {
    store.dispatch(receiveBook(book));
    addCurrentPageToSummaryFilters(helpers);

    const component = renderer.create(<Provider store={store}>
      <MessageProvider>
        <ChapterFilter />
      </MessageProvider>
    </Provider>);

    const [box1] = component.root.findAllByType(Checkbox);

    expect(box1.props.checked).toBe(true);
  });

  it('initially has the selected chapter checked', () => {
    store.dispatch(receiveBook(book));
    store.dispatch(receivePage({...shortPage, references: []}));
    addCurrentPageToSummaryFilters(helpers);

    const component = renderer.create(<Provider store={store}>
      <MessageProvider>
        <ChapterFilter />
      </MessageProvider>
    </Provider>);

    const [, , , , box5] = component.root.findAllByType(Checkbox);

    expect(box5.props.checked).toBe(true);
  });

  it('unchecks chapters', () => {
    store.dispatch(receiveBook(book));
    addCurrentPageToSummaryFilters(helpers);

    const component = renderer.create(<Provider store={store}>
      <MessageProvider>
        <ChapterFilter />
      </MessageProvider>
    </Provider>);

    const [box1, box2] = component.root.findAllByType(Checkbox);

    expect(box1.props.checked).toBe(true);
    expect(box2.props.checked).toBe(false);

    renderer.act(() => {
      box1.props.onChange();
    });

    expect(box1.props.checked).toBe(false);
    expect(box2.props.checked).toBe(false);
  });

  it('checks chapters', () => {
    store.dispatch(receiveBook(book));
    addCurrentPageToSummaryFilters(helpers);

    const component = renderer.create(<Provider store={store}>
      <MessageProvider>
        <ChapterFilter />
      </MessageProvider>
    </Provider>);

    const [box1, box2] = component.root.findAllByType(Checkbox);

    expect(box1.props.checked).toBe(true);
    expect(box2.props.checked).toBe(false);

    renderer.act(() => {
      box2.props.onChange();
    });

    expect(box1.props.checked).toBe(true);
    expect(box2.props.checked).toBe(true);
  });

  it('selects none', () => {
    store.dispatch(receiveBook(book));
    addCurrentPageToSummaryFilters(helpers);

    const component = renderer.create(<Provider store={store}>
      <MessageProvider>
        <ChapterFilter />
      </MessageProvider>
    </Provider>);

    const [box1, box2] = component.root.findAllByType(Checkbox);
    const allOrNone = component.root.findByType(AllOrNone);

    expect(box1.props.checked).toBe(true);
    expect(box2.props.checked).toBe(false);

    renderer.act(() => {
      allOrNone.props.onNone();
    });

    expect(box1.props.checked).toBe(false);
    expect(box2.props.checked).toBe(false);
  });

  it('selects all select only chapters with highlights', () => {
    store.dispatch(receiveBook(book));
    store.dispatch(setHighlightsTotalCountsPerLocation({
      'testbook1-testpage1-uuid': 1,
    }));
    addCurrentPageToSummaryFilters(helpers);

    const component = renderer.create(<Provider store={store}>
      <MessageProvider>
        <ChapterFilter />
      </MessageProvider>
    </Provider>);

    const [box1, box2] = component.root.findAllByType(Checkbox);
    const allOrNone = component.root.findByType(AllOrNone);

    renderer.act(() => {
      allOrNone.props.onNone();
    });

    expect(box1.props.checked).toBe(false);
    expect(box2.props.checked).toBe(false);

    renderer.act(() => {
      allOrNone.props.onAll();
    });

    expect(box1.props.checked).toBe(true);
    expect(box2.props.checked).toBe(false);
  });

  it('chapters without highlights are disabled', () => {
    store.dispatch(receiveBook(book));
    store.dispatch(setHighlightsTotalCountsPerLocation({
      'testbook1-testpage1-uuid': 1,
    }));
    addCurrentPageToSummaryFilters(helpers);

    const component = renderer.create(<Provider store={store}>
      <MessageProvider>
        <ChapterFilter />
      </MessageProvider>
    </Provider>);

    const [box1, box2] = component.root.findAllByType(Checkbox);

    expect(box1.props.disabled).toBe(false);
    expect(box2.props.disabled).toBe(true);
  });
});
