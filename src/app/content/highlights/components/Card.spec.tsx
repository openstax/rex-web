import { Highlight } from '@openstax/highlighter';
import { HighlightColorEnum } from '@openstax/highlighter/dist/api';
import { NewHighlightSourceTypeEnum } from '@openstax/highlighter/highlights-client/dist/models/NewHighlight';
import { HTMLElement } from '@openstax/types/lib.dom';
import React from 'react';
import { Provider } from 'react-redux';
import renderer from 'react-test-renderer';
import createTestStore from '../../../../test/createTestStore';
import { book, page } from '../../../../test/mocks/archiveLoader';
import createMockHighlight from '../../../../test/mocks/highlight';
import { mockCmsBook } from '../../../../test/mocks/osWebLoader';
import * as domUtils from '../../../domUtils';
import { Store } from '../../../types';
import { assertDocument } from '../../../utils';
import { receiveBook, receivePage } from '../../actions';
import { requestSearch } from '../../search/actions';
import { formatBookData } from '../../utils';
import { createHighlight, deleteHighlight, focusHighlight, receiveHighlights } from '../actions';
import { highlightStyles } from '../constants';
import { highlightLocations } from '../selectors';
import { HighlightData } from '../types';
import { getHighlightLocationFilterForPage } from '../utils';
import Card from './Card';
import DisplayNote from './DisplayNote';
import EditCard from './EditCard';

jest.mock('./DisplayNote', () => (jest as any).requireActual('react').forwardRef(
  (props: any, ref: any) => <div ref={ref} mock-display-note {...props} />
));
jest.mock('./EditCard', () => (jest as any).requireActual('react').forwardRef(
  (props: any, ref: any) => <div ref={ref} mock-edit {...props} />
));

describe('Card', () => {
  let store: Store;
  let dispatch: jest.SpyInstance;
  let highlight: ReturnType<typeof createMockHighlight>;
  let highlightData: ReturnType<ReturnType<typeof createMockHighlight>['serialize']>['data'];

  beforeEach(() => {
    store = createTestStore();
    highlight = createMockHighlight('asdf');
    highlightData = highlight.serialize().data;
    dispatch = jest.spyOn(store, 'dispatch');
    highlight.elements = [assertDocument().createElement('span')];
  });

  it('matches snapshot when focused without note', () => {
    highlight.range.getBoundingClientRect.mockReturnValue({
      bottom: 200,
      top: 100,
    });
    const container = {
      nodeName: 'div',
      nodeType: 1,
      offsetParent: {
        nodeName: 'div',
        nodeType: 1,
        offsetTop: 50,
        title: '',
      },
      title: '',
    } as unknown as HTMLElement;
    store.dispatch(receiveBook(formatBookData(book, mockCmsBook)));
    store.dispatch(receivePage({...page, references: []}));
    store.dispatch(receiveHighlights([
      {
        color: highlightStyles[0].label,
        id: highlightData.id,
      },
    ] as HighlightData[]));
    store.dispatch(focusHighlight(highlight.id));
    const component = renderer.create(<Provider store={store}>
      <Card highlight={highlight as unknown as Highlight} container={container} />
    </Provider>);

    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('matches snapshot when passed data without note', () => {
    store.dispatch(receiveBook(formatBookData(book, mockCmsBook)));
    store.dispatch(receivePage({...page, references: []}));
    store.dispatch(receiveHighlights([
      {
        id: highlightData.id,
      },
    ] as HighlightData[]));
    store.dispatch(requestSearch('asdf'));
    const component = renderer.create(<Provider store={store}>
      <Card highlight={highlight as unknown as Highlight} />
    </Provider>);

    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('matches snapshot without data', () => {
    store.dispatch(receiveBook(formatBookData(book, mockCmsBook)));
    store.dispatch(receivePage({...page, references: []}));
    const container = assertDocument().createElement('div');
    highlight.range.getBoundingClientRect.mockReturnValue({
      bottom: 200,
      top: 100,
    });
    const component = renderer.create(<Provider store={store}>
      <Card highlight={highlight as unknown as Highlight} container={container} />
    </Provider>);

    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('scrolls to card when focused', () => {
    const scrollIntoView = jest.spyOn(domUtils, 'scrollIntoView');
    scrollIntoView.mockImplementation(() => null);
    const createNodeMock = () => ({});

    store.dispatch(receiveBook(formatBookData(book, mockCmsBook)));
    store.dispatch(receivePage({...page, references: []}));
    store.dispatch(receiveHighlights([
      {
        id: highlightData.id,
      },
    ] as HighlightData[]));

    renderer.create(<Provider store={store}>
      <Card highlight={highlight as unknown as Highlight} />
    </Provider>, {createNodeMock});

    renderer.act(() => {
      store.dispatch(focusHighlight(highlight.id));
    });

    expect(scrollIntoView).toHaveBeenCalled();
  });

  it('unknown style doesn\'t throw', () => {
    store.dispatch(receiveHighlights([
      {
        color: 'asdfasdfadsf' as HighlightColorEnum,
        id: highlightData.id,
      },
    ] as HighlightData[]));
    expect(() => renderer.create(<Provider store={store}>
      <Card highlight={highlight as unknown as Highlight} />
    </Provider>)).not.toThrow();
  });

  it('switches to editing mode when onEdit is triggered', () => {
    store.dispatch(receiveBook(formatBookData(book, mockCmsBook)));
    store.dispatch(receivePage({...page, references: []}));
    store.dispatch(receiveHighlights([
      {
        annotation: 'adsf',
        color: highlightStyles[0].label,
        id: highlightData.id,
      },
    ] as HighlightData[]));

    const component = renderer.create(<Provider store={store}>
      <Card highlight={highlight as unknown as Highlight} />
    </Provider>);

    const picker = component.root.findByType(DisplayNote);
    renderer.act(() => {
      picker.props.onEdit();
    });

    expect(() => component.root.findByType(EditCard)).not.toThrow();
  });

  it('switches to display mode when cancelling', () => {
    const data = {
      annotation: 'adsf',
      color: highlightStyles[0].label,
      id: highlightData.id,
    } as HighlightData;
    store.dispatch(receiveHighlights([
      data,
    ]));
    store.dispatch(focusHighlight(highlight.id));
    store.dispatch(receiveBook(formatBookData(book, mockCmsBook)));
    store.dispatch(receivePage({...page, references: []}));

    const component = renderer.create(<Provider store={store}>
      <Card highlight={highlight as unknown as Highlight} />
    </Provider>);

    const picker = component.root.findByType(DisplayNote);
    renderer.act(() => {
      picker.props.onEdit();
    });

    const edit = component.root.findByType(EditCard);
    renderer.act(() => {
      edit.props.onCancel();
    });

    expect(() => component.root.findByType(EditCard)).toThrow();
  });

  it('removes when DisplayNote calls onRemove', () => {
    store.dispatch(receiveBook(formatBookData(book, mockCmsBook)));
    store.dispatch(receivePage({...page, references: []}));
    store.dispatch(receiveHighlights([
      {
        annotation: 'adsf',
        color: highlightStyles[0].label,
        id: highlightData.id,
      },
    ] as HighlightData[]));

    const locationFilters = highlightLocations(store.getState());
    const location = getHighlightLocationFilterForPage(locationFilters, page);
    expect(location).toBeDefined();

    const component = renderer.create(<Provider store={store}>
      <Card highlight={highlight as unknown as Highlight} />
    </Provider>);

    const picker = component.root.findByType(DisplayNote);
    renderer.act(() => {
      picker.props.onRemove();
    });

    expect(dispatch).toHaveBeenCalledWith(deleteHighlight(highlight.id, {
      locationFilterId: location!.id,
      pageId: page.id,
    }));
  });

  it('noops when remove is called but there isn\'t anything to remove', () => {
    store.dispatch(receiveBook(formatBookData(book, mockCmsBook)));
    store.dispatch(receivePage({...page, references: []}));
    const component = renderer.create(<Provider store={store}>
      <Card highlight={highlight as unknown as Highlight} />
    </Provider>);

    dispatch.mockClear();

    const picker = component.root.findByType(EditCard);
    picker.props.onRemove();

    expect(dispatch).not.toHaveBeenCalled();
  });

  it('creates when DisplayNote calls onCreate', () => {
    store.dispatch(receiveBook(formatBookData(book, mockCmsBook)));
    store.dispatch(receivePage({...page, references: []}));
    store.dispatch(receiveHighlights([
      {
        annotation: '',
        color: highlightStyles[0].label,
        id: highlight.id,
      },
    ] as HighlightData[]));

    dispatch.mockClear();

    const locationFilters = highlightLocations(store.getState());
    const location = getHighlightLocationFilterForPage(locationFilters, page);
    expect(location).toBeDefined();

    const component = renderer.create(<Provider store={store}>
      <Card highlight={highlight as unknown as Highlight} />
    </Provider>);

    const editcard = component.root.findByType(EditCard);
    renderer.act(() => {
      editcard.props.onCreate();
    });

    expect(dispatch).toHaveBeenCalledWith(createHighlight({
      ...highlight.serialize().getApiPayload(),
      scopeId: 'testbook1-uuid',
      sourceId: 'testbook1-testpage1-uuid',
      sourceType: NewHighlightSourceTypeEnum.OpenstaxPage,
    }, {
      locationFilterId: location!.id,
      pageId: page.id,
    }));
  });

  it('renders null if highlight doen\'t have range', () => {
    (highlight as any).range = undefined;

    const component = renderer.create(<Provider store={store}>
      <Card highlight={highlight as unknown as Highlight} />
    </Provider>);

    expect(() => component.root.findByType(EditCard)).toThrow();
  });

  it('renders null if highlight doen\'t have range and its focused', () => {
    (highlight as any).range = undefined;
    store.dispatch(receiveHighlights([
      {
        color: highlightStyles[0].label,
        id: highlightData.id,
      },
    ] as HighlightData[]));
    store.dispatch(focusHighlight(highlight.id));

    const component = renderer.create(<Provider store={store}>
      <Card highlight={highlight as unknown as Highlight} />
    </Provider>);

    expect(() => component.root.findByType(EditCard)).toThrow();
  });
});
