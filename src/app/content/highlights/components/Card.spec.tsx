import { Highlight } from '@openstax/highlighter';
import React from 'react';
import { Provider } from 'react-redux';
import renderer from 'react-test-renderer';
import createTestStore from '../../../../test/createTestStore';
import createMockHighlight from '../../../../test/mocks/highlight';
import { Store } from '../../../types';
import { assertDocument } from '../../../utils';
import { requestSearch } from '../../search/actions';
import { createHighlight, deleteHighlight, focusHighlight, receiveHighlights, updateHighlight } from '../actions';
import { highlightStyles } from '../constants';
import Card from './Card';
import ColorPicker from './ColorPicker';

jest.mock('./ColorPicker', () => (props: any) => <div mock-color-picker {...props} />);
jest.mock('./Note', () => (props: any) => <div mock-note {...props} />);

describe('Card', () => {
  let store: Store;
  let dispatch: jest.SpyInstance;
  const highlight = createMockHighlight('asdf');
  const highlightData = highlight.serialize().data;

  highlight.elements = [assertDocument().createElement('span')];

  beforeEach(() => {
    store = createTestStore();
    dispatch = jest.spyOn(store, 'dispatch');
  });

  it('matches snapshot when focused', () => {
    store.dispatch(receiveHighlights([
      {
        style: highlightStyles[0].label,
        ...highlightData,
      },
    ]));
    store.dispatch(focusHighlight(highlight.id));
    const component = renderer.create(<Provider store={store}>
      <Card highlight={highlight as unknown as Highlight} />
    </Provider>);

    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('matches snapshot when editing data', () => {
    store.dispatch(receiveHighlights([
      highlight.serialize().data,
    ]));
    store.dispatch(requestSearch('asdf'));
    const component = renderer.create(<Provider store={store}>
      <Card highlight={highlight as unknown as Highlight} />
    </Provider>);

    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('matches snapshot without data', () => {
    const component = renderer.create(<Provider store={store}>
      <Card highlight={highlight as unknown as Highlight} />
    </Provider>);

    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('unknown style doesn\'t throw', () => {
    store.dispatch(receiveHighlights([
      {
        style: 'asdfasdfadsf',
        ...highlight.serialize().data,
      },
    ]));
    expect(() => renderer.create(<Provider store={store}>
      <Card highlight={highlight as unknown as Highlight} />
    </Provider>)).not.toThrow();
  });

  it('removes when ColorPicker calls onRemove', () => {
    store.dispatch(receiveHighlights([
      highlight.serialize().data,
    ]));

    const component = renderer.create(<Provider store={store}>
      <Card highlight={highlight as unknown as Highlight} />
    </Provider>);

    const picker = component.root.findByType(ColorPicker);
    renderer.act(() => {
      picker.props.onRemove();
    });

    expect(dispatch).toHaveBeenCalledWith(deleteHighlight(highlight.id));
  });

  it('noops when remove is called but there isn\'t anything to remove', () => {
    const component = renderer.create(<Provider store={store}>
      <Card highlight={highlight as unknown as Highlight} />
    </Provider>);

    const picker = component.root.findByType(ColorPicker);
    picker.props.onRemove();

    expect(dispatch).not.toHaveBeenCalled();
  });

  it('handles color change when there is data', () => {
    store.dispatch(receiveHighlights([
      highlight.serialize().data,
    ]));

    const component = renderer.create(<Provider store={store}>
      <Card highlight={highlight as unknown as Highlight} />
    </Provider>);

    const picker = component.root.findByType(ColorPicker);
    renderer.act(() => {
      picker.props.onChange('blue');
    });

    expect(highlight.setStyle).toHaveBeenCalledWith('blue');
    expect(dispatch).toHaveBeenCalledWith(updateHighlight({...highlightData, style: 'blue'}));
  });

  it('creates when changing color on a new highlight', () => {
    const component = renderer.create(<Provider store={store}>
      <Card highlight={highlight as unknown as Highlight} />
    </Provider>);

    const picker = component.root.findByType(ColorPicker);
    renderer.act(() => {
      picker.props.onChange('blue');
    });

    expect(highlight.setStyle).toHaveBeenCalledWith('blue');
    expect(dispatch).toHaveBeenCalledWith(createHighlight(highlightData));
  });
});
