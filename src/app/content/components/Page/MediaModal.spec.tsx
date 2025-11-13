import renderer, { act } from 'react-test-renderer';
import MediaModal from './MediaModal';
import React from 'react';

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
});
