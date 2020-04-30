import React from 'react';
import renderer from 'react-test-renderer';
import { makeFindByTestId } from '../../../../test/reactutils';
import MessageProvider from '../../../MessageProvider';
import { assertDocument } from '../../../utils';
import { highlightStyles } from '../constants';
import Confirmation from './Confirmation';
import DisplayNote, { DisplayNoteProps } from './DisplayNote';

jest.mock('./ColorPicker', () => (props: any) => <div mock-color-picker {...props} />);
jest.mock('./TruncatedText', () => (props: any) => <div mock-truncated-text {...props} />);
const doNothing = () => null;

describe('DisplayNote', () => {
  let displayNoteProps: Partial<DisplayNoteProps>;

  beforeEach(() => {
    displayNoteProps = {
      onBlur: doNothing,
      onEdit: doNothing,
      onFocus: jest.fn(),
      onHeightChange: doNothing,
      onRemove: jest.fn(),
      style: highlightStyles[0],
    };
  });

  it('matches snapshot', () => {
    const component = renderer.create(<MessageProvider onError={doNothing}>
      <DisplayNote {...displayNoteProps} isFocused={false} />
    </MessageProvider>);

    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('matches snapshot when focused', () => {
    const component = renderer.create(<MessageProvider onError={doNothing}>
      <DisplayNote {...displayNoteProps} isFocused={true} />
    </MessageProvider>);

    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('shows delete confirmation', () => {
    const component = renderer.create(<MessageProvider onError={doNothing}>
      <DisplayNote {...displayNoteProps} isFocused={true} />
    </MessageProvider>);
    const findByTestId = makeFindByTestId(component.root);

    const deleteButton = findByTestId('delete');
    renderer.act(() => {
      deleteButton.props.onClick();
    });

    expect(() => component.root.findByType(Confirmation)).not.toThrow();
    expect(displayNoteProps.onRemove).not.toHaveBeenCalled();
  });

  it('confirmation deletes', () => {
    const component = renderer.create(<MessageProvider onError={doNothing}>
      <DisplayNote {...displayNoteProps} isFocused={true} />
    </MessageProvider>, { createNodeMock: () => assertDocument().createElement('div')});
    const findByTestId = makeFindByTestId(component.root);

    const deleteButton = findByTestId('delete');
    renderer.act(() => {
      deleteButton.props.onClick();
    });

    const confirmation = component.root.findByType(Confirmation);
    renderer.act(() => {
      confirmation.props.onConfirm();
    });

    expect(displayNoteProps.onRemove).toHaveBeenCalled();
  });

  it('confirmation cancels', () => {
    const component = renderer.create(<MessageProvider onError={doNothing}>
      <DisplayNote {...displayNoteProps} isFocused={true} />
    </MessageProvider>);
    const findByTestId = makeFindByTestId(component.root);

    const deleteButton = findByTestId('delete');
    renderer.act(() => {
      deleteButton.props.onClick();
    });

    const confirmation = component.root.findByType(Confirmation);
    renderer.act(() => {
      confirmation.props.onCancel();
    });

    expect(() => component.root.findByType(Confirmation)).toThrow();
    expect(displayNoteProps.onRemove).not.toHaveBeenCalled();
  });

  it('closes confirmation after changing focus and reopen', () => {
    let isFocused = true;

    const component = renderer.create(<MessageProvider onError={doNothing}>
      <DisplayNote {...displayNoteProps} isFocused={isFocused} />
    </MessageProvider>);

    expect(() => component.root.findByType(Confirmation)).toThrow();

    const findByTestId = makeFindByTestId(component.root);
    const deleteButton = findByTestId('delete');
    renderer.act(() => {
      deleteButton.props.onClick();
    });

    expect(component.root.findByType(Confirmation)).toBeDefined();

    isFocused = false;

    component.update(<MessageProvider onError={doNothing}>
      <DisplayNote {...displayNoteProps} isFocused={isFocused} />
    </MessageProvider>);

    // tslint:disable-next-line: no-empty
    renderer.act(() => {});

    expect(() => component.root.findByType(Confirmation)).toThrow();

    isFocused = true;

    component.update(<MessageProvider onError={doNothing}>
      <DisplayNote {...displayNoteProps} isFocused={isFocused} />
    </MessageProvider>);

    // tslint:disable-next-line: no-empty
    renderer.act(() => {});

    expect(() => component.root.findByType(Confirmation)).toThrow();
    expect(displayNoteProps.onFocus).toHaveBeenCalledTimes(2);
  });
});
