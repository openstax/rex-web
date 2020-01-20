import React from 'react';
import { Provider } from 'react-redux';
import renderer from 'react-test-renderer';
import createTestStore from '../../../../../test/createTestStore';
import { book as archiveBook } from '../../../../../test/mocks/archiveLoader';
import { mockCmsBook } from '../../../../../test/mocks/osWebLoader';
import AllOrNone from '../../../../components/AllOrNone';
import Checkbox from '../../../../components/Checkbox';
import MessageProvider from '../../../../MessageProvider';
import { Store } from '../../../../types';
import { receiveBook } from '../../../actions';
import { formatBookData } from '../../../utils';
import { receiveHighlightsTotalCounts } from '../../actions';
import ColorFilter from './ColorFilter';

describe('ColorFilter', () => {
  const book = formatBookData(archiveBook, mockCmsBook);
  let store: Store;

  beforeEach(() => {
    store = createTestStore();
    store.dispatch(receiveBook(book));
  });

  it('matches snapshot', () => {
    store.dispatch(receiveHighlightsTotalCounts({
      'testbook1-testpage1-uuid': { pink: 2, green: 3 },
      'testbook1-testpage3-uuid': { yellow: 2 },
    }));

    const component = renderer.create(<Provider store={store}>
      <MessageProvider>
        <ColorFilter />
      </MessageProvider>
    </Provider>);

    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('unchecks colors', () => {
    const component = renderer.create(<Provider store={store}>
      <MessageProvider>
        <ColorFilter />
      </MessageProvider>
    </Provider>);

    const [box1, box2] = component.root.findAllByType(Checkbox);

    expect(box1.props.checked).toBe(true);
    expect(box2.props.checked).toBe(true);

    renderer.act(() => {
      box1.props.onChange();
    });

    expect(box1.props.checked).toBe(false);
    expect(box2.props.checked).toBe(true);
  });

  it('checks colors', () => {
    const component = renderer.create(<Provider store={store}>
      <MessageProvider>
        <ColorFilter />
      </MessageProvider>
    </Provider>);

    const [box1, box2] = component.root.findAllByType(Checkbox);

    expect(box1.props.checked).toBe(true);
    expect(box2.props.checked).toBe(true);

    renderer.act(() => {
      box1.props.onChange();
    });
    renderer.act(() => {
      box2.props.onChange();
    });

    expect(box1.props.checked).toBe(false);
    expect(box2.props.checked).toBe(false);

    renderer.act(() => {
      box1.props.onChange();
    });

    expect(box1.props.checked).toBe(true);
    expect(box2.props.checked).toBe(false);
  });

  it('selects none', () => {
    const component = renderer.create(<Provider store={store}>
      <MessageProvider>
        <ColorFilter />
      </MessageProvider>
    </Provider>);

    const [box1, box2] = component.root.findAllByType(Checkbox);
    const allOrNone = component.root.findByType(AllOrNone);

    expect(box1.props.checked).toBe(true);
    expect(box2.props.checked).toBe(true);

    renderer.act(() => {
      allOrNone.props.onNone();
    });

    expect(box1.props.checked).toBe(false);
    expect(box2.props.checked).toBe(false);
  });

  it('selects all', () => {
    const component = renderer.create(<Provider store={store}>
      <MessageProvider>
        <ColorFilter />
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
    expect(box2.props.checked).toBe(true);
  });
});
