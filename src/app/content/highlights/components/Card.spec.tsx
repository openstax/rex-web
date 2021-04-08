import { Highlight } from '@openstax/highlighter';
import { HighlightColorEnum } from '@openstax/highlighter/dist/api';
import { NewHighlightSourceTypeEnum } from '@openstax/highlighter/dist/api';
import { HTMLElement } from '@openstax/types/lib.dom';
import React from 'react';
import { Provider } from 'react-redux';
import renderer from 'react-test-renderer';
import createTestStore from '../../../../test/createTestStore';
import { book, page } from '../../../../test/mocks/archiveLoader';
import createMockHighlight from '../../../../test/mocks/highlight';
import { mockCmsBook } from '../../../../test/mocks/osWebLoader';
import { Store } from '../../../types';
import { assertDocument } from '../../../utils';
import { openToc, receiveBook, receivePage } from '../../actions';
import { highlightStyles } from '../../constants';
import { requestSearch } from '../../search/actions';
import { formatBookData } from '../../utils';
import {
  createHighlight,
  focusHighlight,
  receiveHighlights,
  requestDeleteHighlight,
  setAnnotationChangesPending,
} from '../actions';
import { highlightLocationFilters } from '../selectors';
import { HighlightData } from '../types';
import { getHighlightLocationFilterForPage } from '../utils';
import Card, { CardProps } from './Card';
import DisplayNote from './DisplayNote';
import EditCard from './EditCard';
import showConfirmation from './utils/showConfirmation';

jest.mock('./DisplayNote', () => (jest as any).requireActual('react').forwardRef(
  (props: any, ref: any) => <div ref={ref} mock-display-note {...props} />
));
jest.mock('./EditCard', () => (jest as any).requireActual('react').forwardRef(
  (props: any, ref: any) => <div ref={ref} mock-edit {...props} />
));
jest.mock('./utils/showConfirmation', () => jest.fn(() => new Promise((res) => res(true))));

describe('Card', () => {
  let store: Store;
  let dispatch: jest.SpyInstance;
  let highlight: ReturnType<typeof createMockHighlight>;
  let highlightData: ReturnType<ReturnType<typeof createMockHighlight>['serialize']>['data'];
  let cardProps: Partial<CardProps> & { highlight: Highlight };

  beforeEach(() => {
    store = createTestStore();
    highlight = createMockHighlight('asdf');
    highlightData = highlight.serialize().data;
    dispatch = jest.spyOn(store, 'dispatch');
    highlight.elements = [assertDocument().createElement('span')];
    cardProps = {
      blur: jest.fn(),
      highlight: highlight as unknown as Highlight,
      highlightOffsets: { top: 0, bottom: 0 },
      onHeightChange: () => null,
    };
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
        tagName: 'DIV',
        title: '',
      },
      tagName: 'DIV',
      title: '',
    } as unknown as HTMLElement;
    store.dispatch(receiveBook(formatBookData(book, mockCmsBook)));
    store.dispatch(receivePage({...page, references: []}));
    store.dispatch(receiveHighlights({
      highlights: [
        {
          color: highlightStyles[0].label,
          id: highlightData.id,
        },
      ] as HighlightData[],
      pageId: '123',
    }));
    store.dispatch(focusHighlight(highlight.id));
    const component = renderer.create(<Provider store={store}>
      <Card {...cardProps} container={container} />
    </Provider>);

    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('matches snapshot when passed data without note', () => {
    store.dispatch(receiveBook(formatBookData(book, mockCmsBook)));
    store.dispatch(receivePage({...page, references: []}));
    store.dispatch(receiveHighlights({
      highlights: [
        {
          id: highlightData.id,
        },
      ] as HighlightData[],
      pageId: '123',
    }));
    store.dispatch(focusHighlight(highlight.id));
    store.dispatch(requestSearch('asdf'));
    const component = renderer.create(<Provider store={store}>
      <Card {...cardProps} />
    </Provider>);

    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('matches snapshot without data', () => {
    store.dispatch(receiveBook(formatBookData(book, mockCmsBook)));
    store.dispatch(receivePage({...page, references: []}));
    store.dispatch(focusHighlight(highlight.id));
    store.dispatch(openToc()); // added for css coverage
    store.dispatch(requestSearch('asd')); // added for css coverage
    cardProps.highlightOffsets = undefined; // added for css coverage
    const container = assertDocument().createElement('div');
    highlight.range.getBoundingClientRect.mockReturnValue({
      bottom: 200,
      top: 100,
    });
    const component = renderer.create(<Provider store={store}>
      <Card {...cardProps} container={container} />
    </Provider>);

    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('unknown style doesn\'t throw', () => {
    store.dispatch(receiveHighlights({
      highlights: [
        {
          color: 'asdfasdfadsf' as HighlightColorEnum,
          id: highlightData.id,
        },
      ] as HighlightData[],
      pageId: '123',
    }));
    expect(() => renderer.create(<Provider store={store}>
      <Card {...cardProps} />
    </Provider>)).not.toThrow();
  });

  it('switches to editing mode when onEdit is triggered', () => {
    store.dispatch(receiveBook(formatBookData(book, mockCmsBook)));
    store.dispatch(receivePage({...page, references: []}));
    store.dispatch(receiveHighlights({
      highlights: [
        {
          annotation: 'adsf',
          color: highlightStyles[0].label,
          id: highlightData.id,
        },
      ] as HighlightData[],
      pageId: '123',
    }));

    const component = renderer.create(<Provider store={store}>
      <Card {...cardProps} />
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
    store.dispatch(receiveHighlights({highlights: [data], pageId: '123'}));
    store.dispatch(focusHighlight(highlight.id));
    store.dispatch(receiveBook(formatBookData(book, mockCmsBook)));
    store.dispatch(receivePage({...page, references: []}));

    const component = renderer.create(<Provider store={store}>
      <Card {...cardProps} />
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
    const currentHighlight = {
      annotation: 'adsf',
      color: highlightStyles[0].label,
      id: highlightData.id,
    } as HighlightData;

    store.dispatch(receiveBook(formatBookData(book, mockCmsBook)));
    store.dispatch(receivePage({...page, references: []}));
    store.dispatch(receiveHighlights({
      highlights: [currentHighlight],
      pageId: '123',
    }));

    const locationFilters = highlightLocationFilters(store.getState());
    const location = getHighlightLocationFilterForPage(locationFilters, page);
    expect(location).toBeDefined();

    const component = renderer.create(<Provider store={store}>
      <Card {...cardProps} />
    </Provider>);

    const picker = component.root.findByType(DisplayNote);
    renderer.act(() => {
      picker.props.onRemove();
    });

    expect(dispatch).toHaveBeenCalledWith(requestDeleteHighlight(currentHighlight, {
      locationFilterId: location!.id,
      pageId: page.id,
    }));
  });

  it('noops when remove is called but there isn\'t anything to remove', () => {
    store.dispatch(receiveBook(formatBookData(book, mockCmsBook)));
    store.dispatch(receivePage({...page, references: []}));
    store.dispatch(focusHighlight(highlight.id));
    const component = renderer.create(<Provider store={store}>
      <Card {...cardProps} />
    </Provider>);

    dispatch.mockClear();

    const picker = component.root.findByProps({ 'mock-edit': true });
    picker.props.onRemove();

    expect(dispatch).not.toHaveBeenCalled();
  });

  it('creates when DisplayNote calls onCreate', () => {
    store.dispatch(receiveBook(formatBookData(book, mockCmsBook)));
    store.dispatch(receivePage({...page, references: []}));
    store.dispatch(receiveHighlights({
      highlights: [
        {
          annotation: '',
          color: highlightStyles[0].label,
          id: highlight.id,
        },
      ] as HighlightData[],
      pageId: '123',
    }));
    store.dispatch(focusHighlight(highlight.id));

    dispatch.mockClear();

    const locationFilters = highlightLocationFilters(store.getState());
    const location = getHighlightLocationFilterForPage(locationFilters, page);
    expect(location).toBeDefined();

    const component = renderer.create(<Provider store={store}>
      <Card {...cardProps} />
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
      <Card {...cardProps} />
    </Provider>);

    expect(() => component.root.findByType(EditCard)).toThrow();
  });

  it('renders null if highlight doen\'t have range and its focused', () => {
    (highlight as any).range = undefined;
    store.dispatch(receiveHighlights({
      highlights: [
        {
          color: highlightStyles[0].label,
          id: highlightData.id,
        },
      ] as HighlightData[],
      pageId: '123',
    }));
    store.dispatch(focusHighlight(highlight.id));

    const component = renderer.create(<Provider store={store}>
      <Card {...cardProps} />
    </Provider>);

    expect(() => component.root.findByType(EditCard)).toThrow();
  });

  it('renders null if locationFilter wasn\'t found', () => {
    store.dispatch(receiveBook(formatBookData(book, mockCmsBook)));
    store.dispatch(receivePage({...page, id: 'not-in-book', references: []}));

    const component = renderer.create(<Provider store={store}>
      <Card {...cardProps} />
    </Provider>);

    expect(() => component.root.findByType(EditCard)).toThrow();
  });

  it('focuses on click only if it is not already focused', () => {
    store.dispatch(receiveBook(formatBookData(book, mockCmsBook)));
    store.dispatch(receivePage({...page, references: []}));
    store.dispatch(receiveHighlights({
      highlights: [
        { id: highlightData.id, annotation: 'asd' },
      ] as HighlightData[],
      pageId: '123',
    }));

    const component = renderer.create(<Provider store={store}>
      <Card {...cardProps} />
    </Provider>);

    expect(dispatch).not.toHaveBeenCalledWith(focusHighlight(highlightData.id));

    const card = component.root.findByProps({ 'data-testid': 'card' });
    renderer.act(() => {
      card.props.onClick();
    });

    expect(dispatch).toHaveBeenCalledWith(focusHighlight(highlightData.id));

    dispatch.mockClear();

    renderer.act(() => {
      card.props.onClick();
    });

    expect(dispatch).not.toHaveBeenCalledWith(focusHighlight(highlightData.id));
  });

  it('displays confirm dialog when there are unsaved changes and user clicks on another card', async() => {
    store.dispatch(receiveBook(formatBookData(book, mockCmsBook)));
    store.dispatch(receivePage({...page, references: []}));
    store.dispatch(receiveHighlights({
      highlights: [
        { id: highlightData.id, annotation: 'asd' },
      ] as HighlightData[],
      pageId: '123',
    }));

    store.dispatch(setAnnotationChangesPending(true));

    const component = renderer.create(<Provider store={store}>
      <Card {...cardProps} isActive={false} />
    </Provider>);

    const card = component.root.findByProps({ 'data-testid': 'card' });
    await renderer.act(async() => {
      card.props.onClick();
    });

    expect(showConfirmation).toHaveBeenCalled();
  });

  it('focuses the Card if shouldFocusCard prop is set', () => {
    store.dispatch(receiveBook(formatBookData(book, mockCmsBook)));
    store.dispatch(receivePage({...page, references: []}));
    store.dispatch(receiveHighlights({
      highlights: [
        { id: highlightData.id, annotation: 'asd' },
      ] as HighlightData[],
      pageId: '123',
    }));

    const cardElement = assertDocument().createElement('div');
    const spyFocusCardElement = jest.spyOn(cardElement, 'focus');

    renderer.create(<Provider store={store}>
      <Card {...cardProps} shouldFocusCard={true} />
    </Provider>, { createNodeMock: () => cardElement });

    renderer.act(() => undefined);

    expect(spyFocusCardElement).toHaveBeenCalled();
  });
});
