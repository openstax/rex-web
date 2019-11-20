import React from 'react';
import renderer from 'react-test-renderer';
import AllOrNone from '../../../../components/AllOrNone';
import Checkbox from '../../../../components/Checkbox';
import MessageProvider from '../../../../MessageProvider';
import ColorFilter from './ColorFilter';

describe('ColorFilter', () => {
  it('matches snapshot', () => {
    const component = renderer.create(<MessageProvider>
      <ColorFilter />
    </MessageProvider>);

    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('unchecks colors', () => {
    const component = renderer.create(<MessageProvider>
      <ColorFilter />
    </MessageProvider>);

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
    const component = renderer.create(<MessageProvider>
      <ColorFilter />
    </MessageProvider>);

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
    const component = renderer.create(<MessageProvider>
      <ColorFilter />
    </MessageProvider>);

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
    const component = renderer.create(<MessageProvider>
      <ColorFilter />
    </MessageProvider>);

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
