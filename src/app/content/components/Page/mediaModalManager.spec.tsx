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
      const mockButton = document.createElement('button');
      mockButton.className = 'image-button-wrapper';

      const mockImg = document.createElement('img');
      mockImg.src = 'test.jpg';
      mockImg.alt = 'Test image';
      mockButton.appendChild(mockImg);

      document.body.appendChild(mockButton);

      act(() => {
        ReactDOM.render(<manager.MediaModalPortal />, container);
      });

      act(() => {
        manager.open(mockButton);
      });

      const closeButton = document.querySelector('button[aria-label="Close media preview"]') as HTMLButtonElement;
      expect(closeButton).toBeTruthy();
      expect(document.activeElement).toBe(closeButton);

      document.body.removeChild(mockButton);
    });

    it('returns focus to trigger button after modal closes', () => {
      const mockButton = document.createElement('button');
      mockButton.className = 'image-button-wrapper';

      const mockImg = document.createElement('img');
      mockImg.src = 'test.jpg';
      mockImg.alt = 'Test image';
      mockButton.appendChild(mockImg);

      document.body.appendChild(mockButton);
      const focusSpy = jest.spyOn(mockButton, 'focus');

      act(() => {
        ReactDOM.render(<manager.MediaModalPortal />, container);
      });

      act(() => {
        manager.open(mockButton);
      });

      const closeButton = document.querySelector('button[aria-label="Close media preview"]') as HTMLButtonElement;
      expect(closeButton).toBeTruthy();

      act(() => {
        closeButton.click();
      });

      act(() => {
        jest.runAllTimers();
      });

      expect(focusSpy).toHaveBeenCalled();

      document.body.removeChild(mockButton);
      focusSpy.mockRestore();
    });

    it('returns focus to trigger button after Escape key closes modal', () => {
      const mockButton = document.createElement('button');
      mockButton.className = 'image-button-wrapper';

      const mockImg = document.createElement('img');
      mockImg.src = 'test.jpg';
      mockImg.alt = 'Test image';
      mockButton.appendChild(mockImg);

      document.body.appendChild(mockButton);
      const focusSpy = jest.spyOn(mockButton, 'focus');

      act(() => {
        ReactDOM.render(<manager.MediaModalPortal />, container);
      });

      act(() => {
        manager.open(mockButton);
      });

      act(() => {
        const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true });
        document.dispatchEvent(escapeEvent);
      });

      act(() => {
        jest.runAllTimers();
      });

      expect(focusSpy).toHaveBeenCalled();

      document.body.removeChild(mockButton);
      focusSpy.mockRestore();
    });
  });

  describe('modal content creation', () => {
    it('extracts image from button to create modal content', () => {
      const mockButton = document.createElement('button');
      mockButton.className = 'image-button-wrapper';

      const mockImg = document.createElement('img');
      mockImg.src = 'test-image.jpg';
      mockImg.alt = 'Test alt text';
      mockImg.width = 800;
      mockImg.height = 600;
      mockButton.appendChild(mockImg);

      act(() => {
        ReactDOM.render(<manager.MediaModalPortal />, container);
      });

      act(() => {
        manager.open(mockButton);
      });

      const modalImages = document.querySelectorAll('img');
      const modalImg = Array.from(modalImages).find(img => img !== mockImg);

      expect(modalImg).toBeTruthy();
      expect(modalImg?.src).toContain('test-image.jpg');
      expect(modalImg?.alt).toBe('Test alt text');
      expect(modalImg?.width).toBe(800);
      expect(modalImg?.height).toBe(600);
      expect(modalImg?.tabIndex).toBe(0);
    });

    it('does not open modal if button has no image', () => {
      const mockButton = document.createElement('button');
      mockButton.className = 'image-button-wrapper';

      act(() => {
        ReactDOM.render(<manager.MediaModalPortal />, container);
      });

      act(() => {
        manager.open(mockButton);
      });

      const closeButton = document.querySelector('button[aria-label="Close media preview"]');
      expect(closeButton).toBeNull();
    });
  });
});
