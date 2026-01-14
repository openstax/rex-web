import React from 'react';
import ReactDOM from 'react-dom';
import { act } from 'react-dom/test-utils';
import { createMediaModalManager } from './mediaModalManager';
import { assertDocument } from '../../../utils';
import { HTMLDivElement, HTMLButtonElement } from '@openstax/types/lib.dom';

describe('mediaModalManager', () => {
  let manager: ReturnType<typeof createMediaModalManager>;
  let container: HTMLDivElement;
  const document = assertDocument();

  beforeEach(() => {
    jest.useFakeTimers();
    manager = createMediaModalManager();
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    ReactDOM.unmountComponentAtNode(container);
    document.body.removeChild(container);
  });

  describe('focus management', () => {
    it('focuses close button when modal opens', () => {
      // Create a mock button element
      const mockButton = document.createElement('button');
      mockButton.className = 'image-button-wrapper';

      // Create and append an img element to the button
      const mockImg = document.createElement('img');
      mockImg.src = 'test.jpg';
      mockImg.alt = 'Test image';
      mockButton.appendChild(mockImg);

      // Add button to document
      document.body.appendChild(mockButton);

      // Render the MediaModalPortal component
      act(() => {
        ReactDOM.render(<manager.MediaModalPortal />, container);
      });

      // Open the modal
      act(() => {
        manager.open(mockButton);
      });

      // Get the close button from the rendered modal
      const closeButton = document.querySelector('button[aria-label="Close media preview"]') as HTMLButtonElement;
      expect(closeButton).toBeTruthy();

      // Verify the close button is the active element (has focus)
      expect(document.activeElement).toBe(closeButton);

      // Cleanup
      document.body.removeChild(mockButton);
    });

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
      act(() => {
        ReactDOM.render(<manager.MediaModalPortal />, container);
      });

      // Open the modal
      act(() => {
        manager.open(mockButton);
      });

      // Get the close button from the rendered modal (it's in document.body due to portal)
      const closeButton = document.querySelector('button[aria-label="Close media preview"]') as HTMLButtonElement;
      expect(closeButton).toBeTruthy();

      // Close the modal
      act(() => {
        closeButton.click();
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
      act(() => {
        ReactDOM.render(<manager.MediaModalPortal />, container);
      });

      // Open the modal
      act(() => {
        manager.open(mockButton);
      });

      // Simulate Escape key press
      act(() => {
        const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true });
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
      act(() => {
        ReactDOM.render(<manager.MediaModalPortal />, container);
      });

      // Open the modal
      act(() => {
        manager.open(mockButton);
      });

      // Find the img element inside the modal (it's in document.body due to portal)
      const modalImages = document.querySelectorAll('img');
      // Find the image that's NOT the original button image
      const modalImg = Array.from(modalImages).find(img => img !== mockImg);

      expect(modalImg).toBeTruthy();
      expect(modalImg?.src).toContain('test-image.jpg');
      expect(modalImg?.alt).toBe('Test alt text');
      expect(modalImg?.width).toBe(800);
      expect(modalImg?.height).toBe(600);
      expect(modalImg?.tabIndex).toBe(0);
    });

    it('does not open modal if button has no image', () => {
      // Create a mock button without an image
      const mockButton = document.createElement('button');
      mockButton.className = 'image-button-wrapper';

      // Render the MediaModalPortal component
      act(() => {
        ReactDOM.render(<manager.MediaModalPortal />, container);
      });

      // Try to open the modal
      act(() => {
        manager.open(mockButton);
      });

      // Verify modal is not open (should not find close button in the DOM)
      const closeButton = document.querySelector('button[aria-label="Close media preview"]');
      expect(closeButton).toBeNull();
    });
  });
});
