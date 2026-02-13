import renderer, { act } from 'react-test-renderer';
import MediaModal from './MediaModal';
import React from 'react';
import { runHooks } from '../../../../test/utils';
import { assertDocument } from '../../../utils';

describe('MediaModal', () => {
  const mockClose = jest.fn();

  const renderMediaModal = (isOpen: boolean) =>
    renderer.create(
      <MediaModal isOpen={isOpen} onClose={mockClose}>
        <div>Test Content</div>
      </MediaModal>
    );

  beforeEach(() => {
    mockClose.mockReset();
  });

  it('does not render when isOpen is false', () => {
    const tree = renderMediaModal(false).toJSON();
    expect(tree).toBeNull();
  });

  it('renders correctly when isOpen is true', () => {
    const tree = renderMediaModal(true).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('calls onClose when overlay is clicked', () => {
    const component = renderMediaModal(true);

    const overlay = component.root
    .findAllByType('div')
    .find(el => el.props.onClick === mockClose);
    if (!overlay) {
      throw new Error('Overlay div with onClick handler not found');
    }

    act(() => {
      overlay.props.onClick();
    });

    expect(mockClose).toHaveBeenCalled();
  });

  it('calls onClose when close button is clicked', () => {
    const component = renderMediaModal(true);

    const closeButton = component.root.findAllByType('button')[0];

    act(() => {
      closeButton.props.onClick();
    });

    expect(mockClose).toHaveBeenCalled();
  });

  it('has close button with ref for focus management', () => {
    // This test verifies that the close button has the structure needed for focus management
    // The actual focus behavior is tested in mediaModalManager.spec.tsx using ReactDOM
    const component = renderMediaModal(true);

    // Verify close button exists and has the correct aria-label
    const closeButton = component.root.findAllByType('button')[0];
    expect(closeButton).toBeTruthy();
    expect(closeButton.props['aria-label']).toBe('Close media preview');
  });

  it('traps Tab and Shift+Tab within the modal', () => {
    const document = assertDocument();
    const wrapperElement = document.createElement('div');
    const closeButtonElement = document.createElement('button');
    wrapperElement.appendChild(closeButtonElement);
    // createTrapTab filters out hidden elements (offsetWidth/offsetHeight === 0)
    Object.defineProperty(closeButtonElement, 'offsetWidth', { value: 40 });
    Object.defineProperty(closeButtonElement, 'offsetHeight', { value: 40 });

    const spyFocus = jest.spyOn(closeButtonElement, 'focus');

    const createNodeMock = (element: React.ReactElement) => {
      if (element.type === 'button') { return closeButtonElement; }
      return wrapperElement;
    };

    renderer.create(
      <MediaModal isOpen={true} onClose={mockClose}>
        <div>Test Content</div>
      </MediaModal>,
      { createNodeMock }
    );

    runHooks(renderer);

    // The useEffect for initial focus calls closeButtonElement.focus() once on mount
    const initialCalls = spyFocus.mock.calls.length;

    // Tab triggers focus trap
    renderer.act(() => {
      wrapperElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }));
    });
    expect(spyFocus).toHaveBeenCalledTimes(initialCalls + 1);

    // Shift+Tab triggers focus trap
    renderer.act(() => {
      wrapperElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, bubbles: true }));
    });
    expect(spyFocus).toHaveBeenCalledTimes(initialCalls + 2);

    // Non-Tab key does not trigger focus trap
    renderer.act(() => {
      wrapperElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'a', bubbles: true }));
    });
    expect(spyFocus).toHaveBeenCalledTimes(initialCalls + 2);
  });

});
