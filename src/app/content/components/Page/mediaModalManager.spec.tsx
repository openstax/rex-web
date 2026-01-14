import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { createMediaModalManager } from './mediaModalManager';

describe('mediaModalManager', () => {
  let manager: ReturnType<typeof createMediaModalManager>;

  beforeEach(() => {
    jest.useFakeTimers();
    manager = createMediaModalManager();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('focus restoration', () => {
    it('returns focus to trigger button after modal closes', () => {
      // Create a mock button element
      const mockButton = document.createElement('button');
      mockButton.className = 'image-button-wrapper';

      // Create and append an img element to the button
      const mockImg = document.createElement('img');
      mockImg.src = 'test.jpg';
      mockImg.alt = 'Test image';
      mockButton.appendChild(mockImg);

      // Add button to document so focus() will work
      document.body.appendChild(mockButton);

      // Spy on the button's focus method
      const focusSpy = jest.spyOn(mockButton, 'focus');

      // Render the MediaModalPortal component
      const component = renderer.create(<manager.MediaModalPortal />);

      // Open the modal
      act(() => {
        manager.open(mockButton);
      });

      // Get the close button from the rendered modal
      const closeButton = component.root.findAllByType('button')[0];

      // Close the modal
      act(() => {
        closeButton.props.onClick();
      });

      // Run timers to execute the setTimeout callback
      act(() => {
        jest.runAllTimers();
      });

      // Verify focus was called on the trigger button
      expect(focusSpy).toHaveBeenCalled();

      // Cleanup
      document.body.removeChild(mockButton);
      focusSpy.mockRestore();
    });

    it('returns focus to trigger button after Escape key closes modal', () => {
      // Create a mock button element
      const mockButton = document.createElement('button');
      mockButton.className = 'image-button-wrapper';

      // Create and append an img element to the button
      const mockImg = document.createElement('img');
      mockImg.src = 'test.jpg';
      mockImg.alt = 'Test image';
      mockButton.appendChild(mockImg);

      // Add button to document so focus() will work
      document.body.appendChild(mockButton);

      // Spy on the button's focus method
      const focusSpy = jest.spyOn(mockButton, 'focus');

      // Render the MediaModalPortal component
      renderer.create(<manager.MediaModalPortal />);

      // Open the modal
      act(() => {
        manager.open(mockButton);
      });

      // Simulate Escape key press
      act(() => {
        const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape' });
        document.dispatchEvent(escapeEvent);
      });

      // Run timers to execute the setTimeout callback
      act(() => {
        jest.runAllTimers();
      });

      // Verify focus was called on the trigger button
      expect(focusSpy).toHaveBeenCalled();

      // Cleanup
      document.body.removeChild(mockButton);
      focusSpy.mockRestore();
    });
  });

  describe('modal content creation', () => {
    it('extracts image from button to create modal content', () => {
      // Create a mock button element
      const mockButton = document.createElement('button');
      mockButton.className = 'image-button-wrapper';

      // Create and append an img element with specific properties
      const mockImg = document.createElement('img');
      mockImg.src = 'test-image.jpg';
      mockImg.alt = 'Test alt text';
      mockImg.width = 800;
      mockImg.height = 600;
      mockButton.appendChild(mockImg);

      // Render the MediaModalPortal component
      const component = renderer.create(<manager.MediaModalPortal />);

      // Open the modal
      act(() => {
        manager.open(mockButton);
      });

      // Find the img element inside the modal
      const modalImg = component.root.findAllByType('img')[0];

      // Verify the image properties match the original
      expect(modalImg.props.src).toBe('test-image.jpg');
      expect(modalImg.props.alt).toBe('Test alt text');
      expect(modalImg.props.width).toBe(800);
      expect(modalImg.props.height).toBe(600);
      expect(modalImg.props.tabIndex).toBe(0);
    });

    it('does not open modal if button has no image', () => {
      // Create a mock button without an image
      const mockButton = document.createElement('button');
      mockButton.className = 'image-button-wrapper';

      // Render the MediaModalPortal component
      const component = renderer.create(<manager.MediaModalPortal />);

      // Try to open the modal
      act(() => {
        manager.open(mockButton);
      });

      // Verify modal is not open (should not find close button)
      const buttons = component.root.findAllByType('button');
      expect(buttons.length).toBe(0);
    });
  });
});
