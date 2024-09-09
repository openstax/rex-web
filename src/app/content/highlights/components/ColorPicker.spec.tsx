import React from 'react';
import renderer from 'react-test-renderer';
import { renderToDom, dispatchKeyDownEvent } from '../../../../test/reactutils';
import TestContainer from '../../../../test/TestContainer';
import { highlightStyles } from '../../constants';
import ColorPicker from './ColorPicker';
import { HTMLElement, HTMLFieldSetElement, HTMLInputElement, HTMLButtonElement } from '@openstax/types/lib.dom';
import { assertDocument } from '../../../utils';

describe('ColorPicker', () => {
  it('matches snapshot no selection', () => {
    const component = renderer.create(<TestContainer>
      <ColorPicker onChange={jest.fn()} onRemove={jest.fn()} />
    </TestContainer>);
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('checks selection', () => {
    const component = renderer.create(<TestContainer>
      <ColorPicker color={highlightStyles[0].label} onChange={jest.fn()} onRemove={jest.fn()} />
    </TestContainer>);

    const [first, ...rest] = component.root.findAllByType('input');
    expect(first.props.checked).toEqual(true);
    rest.forEach((input) => expect(input.props.checked).toEqual(false));
  });

  it('checks selection (multiple)', () => {
    const component = renderer.create(<TestContainer>
      <ColorPicker multiple selected={[highlightStyles[0].label]} onChange={jest.fn()} onRemove={jest.fn()} />
    </TestContainer>);

    const [first, ...rest] = component.root.findAllByType('input');
    expect(first.props.checked).toEqual(true);
    rest.forEach((input) => expect(input.props.checked).toEqual(false));
  });

  it('calls update when changing selection', () => {
    const onChange = jest.fn();
    const onRemove = jest.fn();

    const component = renderer.create(<TestContainer>
      <ColorPicker color={highlightStyles[0].label} onChange={onChange} onRemove={onRemove} />
    </TestContainer>);

    const [, second] = component.root.findAllByType('input');

    second.props.onChange();

    expect(onRemove).not.toHaveBeenCalled();
    expect(onChange).toHaveBeenCalledWith(highlightStyles[1].label);
  });

  it('calls update when changing selection (multiple)', () => {
    const onChange = jest.fn();
    const onRemove = jest.fn();

    const component = renderer.create(<TestContainer>
      <ColorPicker multiple selected={[highlightStyles[0].label]} onChange={onChange} onRemove={onRemove} />
    </TestContainer>);

    const [, second] = component.root.findAllByType('input');

    second.props.onChange();

    expect(onRemove).not.toHaveBeenCalled();
    expect(onChange).toHaveBeenCalledWith([highlightStyles[0].label, highlightStyles[1].label]);
  });

  it('calls remove when changing selection', () => {
    const onChange = jest.fn();
    const onRemove = jest.fn();

    const component = renderer.create(<TestContainer>
      <ColorPicker color={highlightStyles[0].label} onChange={onChange} onRemove={onRemove} />
    </TestContainer>);

    const [first] = component.root.findAllByType('input');

    first.props.onChange();

    expect(onRemove).toHaveBeenCalled();
    expect(onChange).not.toHaveBeenCalled();
  });

  it('calls remove when trashcan is clicked', () => {
    const onChange = jest.fn();
    const onRemove = jest.fn();

    const {root} = renderToDom(<TestContainer>
      <ColorPicker color={highlightStyles[0].label} onChange={onChange} onRemove={onRemove} />
    </TestContainer>);

    const button = root.querySelector('button') as HTMLButtonElement;

    // This should trigger the button, but does not in testing
    dispatchKeyDownEvent({
      element: button as HTMLElement,
      key: 'Enter',
    });

    button.click();
    expect(onRemove).toHaveBeenCalled();
    expect(onChange).not.toHaveBeenCalled();
  });

  it('handles having no onRemove when trashcan is clicked', () => {
    const onChange = jest.fn();
    const component = renderer.create(<TestContainer>
      <ColorPicker color={highlightStyles[0].label} onChange={onChange} />
    </TestContainer>);

    const button = component.root.findByType('button');

    button.props.onClick();
    expect(onChange).not.toHaveBeenCalled();
  });

  it('operates as a radiogroup', () => {
    const onChange = jest.fn();
    const onRemove = jest.fn();
    const {root} = renderToDom(
      <TestContainer>
        <ColorPicker color={highlightStyles[0].label} onChange={onChange} onRemove={onRemove} />
      </TestContainer>
    );
    const rg = root.querySelector('fieldset') as HTMLFieldSetElement;

    expect(rg).toBeTruthy();
    rg?.focus();

    const inputs = Array.from(rg.querySelectorAll('input'));
    const checkedIdx = () => {
      const i2 = assertDocument().activeElement as HTMLInputElement;
      return inputs.indexOf(i2);
    };

    expect(checkedIdx()).toBe(0);
    dispatchKeyDownEvent({
      element: rg as HTMLElement,
      key: 'End',
    });
    expect(checkedIdx()).toBe(4);
    dispatchKeyDownEvent({
      element: rg as HTMLElement,
      key: 'ArrowLeft',
    });
    expect(checkedIdx()).toBe(3);
    dispatchKeyDownEvent({
      element: rg as HTMLElement,
      key: 'ArrowRight',
    });
    expect(checkedIdx()).toBe(4);
    dispatchKeyDownEvent({
      element: rg as HTMLElement,
      key: 'Home',
    });
    expect(checkedIdx()).toBe(0);

    dispatchKeyDownEvent({
      element: rg as HTMLElement,
      key: ' ',
    });
    expect(checkedIdx()).toBe(0);

    // Ignores other keys
    dispatchKeyDownEvent({
      element: rg as HTMLElement,
      key: 'ArrowDown',
    });
    expect(checkedIdx()).toBe(0);

  });

  it('focuses on the selected color', () => {
    const onChange = jest.fn();
    const onRemove = jest.fn();
    const {root} = renderToDom(
      <TestContainer>
        <ColorPicker color={highlightStyles[0].label} onChange={onChange} onRemove={onRemove} />
      </TestContainer>
    );
    const rg = root.querySelector('fieldset') as HTMLFieldSetElement;

    expect(rg).toBeTruthy();
    rg?.focus();
  });

  it('calls remove when changing selection (multiple)', () => {
    const onChange = jest.fn();
    const onRemove = jest.fn();

    const component = renderer.create(<TestContainer>
      <ColorPicker multiple selected={[highlightStyles[0].label]} onChange={onChange} onRemove={onRemove} />
    </TestContainer>);

    const [first] = component.root.findAllByType('input');

    first.props.onChange();

    expect(onRemove).not.toHaveBeenCalled();
    expect(onChange).toHaveBeenCalledWith([]);
  });

  it('do not call remove if it was not passed', () => {
    const onChange = jest.fn();

    const component = renderer.create(<TestContainer>
      <ColorPicker color={highlightStyles[0].label} onChange={onChange} />
    </TestContainer>);

    const [first] = component.root.findAllByType('input');

    first.props.onChange();

    expect(onChange).not.toHaveBeenCalled();
  });
});
