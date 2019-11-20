import React from 'react';
import renderer from 'react-test-renderer';
import { highlightStyles } from '../constants';
import ColorPicker from './ColorPicker';

describe('ColorPicker', () => {
  it('matches snapshot no selection', () => {
    const component = renderer.create(<ColorPicker onChange={jest.fn()} onRemove={jest.fn()} />);
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('checks selection', () => {
    const component = renderer.create(
      <ColorPicker color={highlightStyles[0].label} onChange={jest.fn()} onRemove={jest.fn()} />
    );

    const [first, ...rest] = component.root.findAllByType('input');
    expect(first.props.checked).toEqual(true);
    rest.forEach((input) => expect(input.props.checked).toEqual(false));
  });

  it('checks selection (multiple)', () => {
    const component = renderer.create(
      <ColorPicker multiple selected={[highlightStyles[0].label]} onChange={jest.fn()} onRemove={jest.fn()} />
    );

    const [first, ...rest] = component.root.findAllByType('input');
    expect(first.props.checked).toEqual(true);
    rest.forEach((input) => expect(input.props.checked).toEqual(false));
  });

  it('calls update when changing selection', () => {
    const onChange = jest.fn();
    const onRemove = jest.fn();

    const component = renderer.create(
      <ColorPicker color={highlightStyles[0].label} onChange={onChange} onRemove={onRemove} />
    );

    const [, second] = component.root.findAllByType('input');

    second.props.onChange();

    expect(onRemove).not.toHaveBeenCalled();
    expect(onChange).toHaveBeenCalledWith(highlightStyles[1].label);
  });

  it('calls update when changing selection (multiple)', () => {
    const onChange = jest.fn();
    const onRemove = jest.fn();

    const component = renderer.create(
      <ColorPicker multiple selected={[highlightStyles[0].label]} onChange={onChange} onRemove={onRemove} />
    );

    const [, second] = component.root.findAllByType('input');

    second.props.onChange();

    expect(onRemove).not.toHaveBeenCalled();
    expect(onChange).toHaveBeenCalledWith([highlightStyles[0].label, highlightStyles[1].label]);
  });

  it('calls remove when changing selection', () => {
    const onChange = jest.fn();
    const onRemove = jest.fn();

    const component = renderer.create(
      <ColorPicker color={highlightStyles[0].label} onChange={onChange} onRemove={onRemove} />
    );

    const [first] = component.root.findAllByType('input');

    first.props.onChange();

    expect(onRemove).toHaveBeenCalled();
    expect(onChange).not.toHaveBeenCalled();
  });

  it('calls remove when changing selection (multiple)', () => {
    const onChange = jest.fn();
    const onRemove = jest.fn();

    const component = renderer.create(
      <ColorPicker multiple selected={[highlightStyles[0].label]} onChange={onChange} onRemove={onRemove} />
    );

    const [first] = component.root.findAllByType('input');

    first.props.onChange();

    expect(onRemove).not.toHaveBeenCalled();
    expect(onChange).toHaveBeenCalledWith([]);
  });
});
