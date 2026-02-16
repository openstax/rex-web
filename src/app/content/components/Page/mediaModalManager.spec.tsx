import React from 'react';
import ReactDOM from 'react-dom';
import { act } from 'react-dom/test-utils';
import { createMediaModalManager } from './mediaModalManager';
import { assertDocument } from '../../../utils';
import { HTMLDivElement } from '@openstax/types/lib.dom';

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
        mockButton.focus();
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
        mockButton.focus();
        manager.open(mockButton);
      });

      const closeButton = document.querySelector('button[aria-label="Close media preview"]') as HTMLButtonElement;
      expect(closeButton).toBeTruthy();

      act(() => {
        (closeButton as any).click();
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
        mockButton.focus();
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

    it('does not crash if no opening element is found on close', () => {
      const mockButton = document.createElement('button');
      mockButton.className = 'image-button-wrapper';
      const mockImg = document.createElement('img');
      mockImg.src = 'test.jpg';
      mockButton.appendChild(mockImg);
      document.body.appendChild(mockButton);

      act(() => {
        ReactDOM.render(<manager.MediaModalPortal />, container);
      });

      act(() => {
        manager.open(mockButton);
      });

      const closeButton = document.querySelector('button[aria-label="Close media preview"]') as HTMLButtonElement;

      // We don't focus the button, so captureOpeningElement might capture body or something else.
      act(() => {
        (closeButton as any).click();
      });

      act(() => {
        jest.runAllTimers();
      });

      document.body.removeChild(mockButton);
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
      document.body.appendChild(mockButton);

      act(() => {
        ReactDOM.render(<manager.MediaModalPortal />, container);
      });

      act(() => {
        mockButton.focus();
        manager.open(mockButton);
      });

      const modalImages = document.querySelectorAll('img');
      const modalImg = Array.from(modalImages).find(img => img !== mockImg);

      expect(modalImg).toBeTruthy();
      expect(modalImg?.src).toContain('http://localhost/test-image.jpg');
      expect(modalImg?.alt).toBe('Test alt text');
      expect(modalImg?.width).toBe(800);
      expect(modalImg?.height).toBe(600);
      expect(modalImg?.tabIndex).toBe(0);
      document.body.removeChild(mockButton);
    });

    it('handles interaction with keyboard (Enter)', () => {
      const mockButton = document.createElement('button');
      mockButton.className = 'image-button-wrapper';
      const mockImg = document.createElement('img');
      mockImg.src = 'test.jpg';
      mockButton.appendChild(mockImg);
      document.body.appendChild(mockButton);

      const mountContainer = document.createElement('div');
      document.body.appendChild(mountContainer);
      manager.mount(mountContainer);
      mountContainer.appendChild(mockButton);

      act(() => {
        ReactDOM.render(<manager.MediaModalPortal />, container);
      });

      act(() => {
        const enterEvent = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true });
        mockButton.dispatchEvent(enterEvent);
      });

      const closeButton = document.querySelector('button[aria-label="Close media preview"]');
      expect(closeButton).toBeTruthy();

      manager.unmount();
      document.body.removeChild(mountContainer);
    });

    it('handles interaction with keyboard (Space)', () => {
      const mockButton = document.createElement('button');
      mockButton.className = 'image-button-wrapper';
      const mockImg = document.createElement('img');
      mockImg.src = 'test.jpg';
      mockButton.appendChild(mockImg);
      document.body.appendChild(mockButton);

      const mountContainer = document.createElement('div');
      document.body.appendChild(mountContainer);
      manager.mount(mountContainer);
      mountContainer.appendChild(mockButton);

      act(() => {
        ReactDOM.render(<manager.MediaModalPortal />, container);
      });

      act(() => {
        const spaceEvent = new KeyboardEvent('keydown', { key: ' ', bubbles: true });
        mockButton.dispatchEvent(spaceEvent);
      });

      const closeButton = document.querySelector('button[aria-label="Close media preview"]');
      expect(closeButton).toBeTruthy();

      manager.unmount();
      document.body.removeChild(mountContainer);
    });

    it('ignores other keys during interaction', () => {
      const mockButton = document.createElement('button');
      mockButton.className = 'image-button-wrapper';
      const mockImg = document.createElement('img');
      mockImg.src = 'test.jpg';
      mockButton.appendChild(mockImg);

      const mountContainer = document.createElement('div');
      document.body.appendChild(mountContainer);
      manager.mount(mountContainer);
      mountContainer.appendChild(mockButton);

      const openSpy = jest.spyOn(manager, 'open');

      act(() => {
        const tabEvent = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true });
        mockButton.dispatchEvent(tabEvent);
      });

      expect(openSpy).not.toHaveBeenCalled();

      manager.unmount();
      document.body.removeChild(mountContainer);
    });

    it('ignores clicks outside of button', () => {
      const mountContainer = document.createElement('div');
      document.body.appendChild(mountContainer);
      manager.mount(mountContainer);

      const openSpy = jest.spyOn(manager, 'open');

      act(() => {
        const clickEvent = new (window as any).MouseEvent('click', { bubbles: true });
        mountContainer.dispatchEvent(clickEvent);
      });

      expect(openSpy).not.toHaveBeenCalled();

      manager.unmount();
      document.body.removeChild(mountContainer);
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

  describe('handleClose', () => {
    it('returns focus to opening element and clears it', () => {
      const mockButton = document.createElement('button');
      mockButton.className = 'image-button-wrapper';
      const mockImg = document.createElement('img');
      mockImg.src = 'test.jpg';
      mockButton.appendChild(mockImg);
      document.body.appendChild(mockButton);

      act(() => {
        ReactDOM.render(<manager.MediaModalPortal />, container);
      });

      act(() => {
        mockButton.focus();
        manager.open(mockButton);
      });

      // Spy on focus and clearOpeningElement
      const focusSpy = jest.spyOn(mockButton, 'focus');
      const clearSpy = jest.spyOn(require('../../utils/focusManager'), 'clearOpeningElement');

      // Find close button and click it
      const closeButton = document.querySelector('button[aria-label="Close media preview"]') as HTMLButtonElement;
      expect(closeButton).toBeTruthy();

      act(() => {
        (closeButton as any).click();
      });

      act(() => {
        jest.runAllTimers();
      });

      expect(focusSpy).toHaveBeenCalled();
      expect(clearSpy).toHaveBeenCalledWith('mediamodal');

      document.body.removeChild(mockButton);
      focusSpy.mockRestore();
      clearSpy.mockRestore();
    });

    it('does not clear opening element when none is found', () => {
      const mockButton = document.createElement('button');
      mockButton.className = 'image-button-wrapper';
      const mockImg = document.createElement('img');
      mockImg.src = 'test.jpg';
      mockButton.appendChild(mockImg);
      document.body.appendChild(mockButton);

      act(() => {
        ReactDOM.render(<manager.MediaModalPortal />, container);
      });

      act(() => {
        manager.open(mockButton);
      });

      // Simulate open without a captured element
      const focusManager = require('../../utils/focusManager');
      const getSpy = jest.spyOn(focusManager, 'getOpeningElement').mockReturnValue(null);
      const clearSpy = jest.spyOn(focusManager, 'clearOpeningElement');

      // Find close button and click it
      const closeButton = document.querySelector('button[aria-label="Close media preview"]') as HTMLButtonElement;
      expect(closeButton).toBeTruthy();

      act(() => {
        (closeButton as any).click();
      });

      act(() => {
        jest.runAllTimers();
      });

      expect(getSpy).toHaveBeenCalledWith('mediamodal');
      // Based on code, clearOpeningElement is NOT called if openingElement is null
      expect(clearSpy).not.toHaveBeenCalled();

      getSpy.mockRestore();
      clearSpy.mockRestore();
      document.body.removeChild(mockButton);
    });
  });

  describe('edge cases', () => {
    it('handles "Esc" key (standardised name for Escape in some environments)', () => {
      const mockButton = document.createElement('button');
      mockButton.className = 'image-button-wrapper';
      const mockImg = document.createElement('img');
      mockImg.src = 'test.jpg';
      mockButton.appendChild(mockImg);
      document.body.appendChild(mockButton);

      act(() => {
        ReactDOM.render(<manager.MediaModalPortal />, container);
      });

      act(() => {
        manager.open(mockButton);
      });

      act(() => {
        const escEvent = new KeyboardEvent('keydown', { key: 'Esc', bubbles: true });
        document.dispatchEvent(escEvent);
      });

      act(() => {
        jest.runAllTimers();
      });

      const closeButton = document.querySelector('button[aria-label="Close media preview"]');
      expect(closeButton).toBeNull();

      document.body.removeChild(mockButton);
    });

    it('handles mounting to the same container', () => {
      const mountContainer = document.createElement('div');
      document.body.appendChild(mountContainer);

      manager.mount(mountContainer);
      const attachSpy = jest.spyOn(mountContainer, 'addEventListener');

      manager.mount(mountContainer);
      // It should still call attach() which calls addEventListener
      expect(attachSpy).toHaveBeenCalled();

      manager.unmount();
      document.body.removeChild(mountContainer);
      attachSpy.mockRestore();
    });

    it('does not crash when calling open before mount', () => {
      const mockButton = document.createElement('button');
      expect(() => {
        manager.open(mockButton as any);
      }).not.toThrow();
    });

    it('does not open modal if image is missing in open call', () => {
      const mockButton = document.createElement('button');
      mockButton.className = 'image-button-wrapper';
      document.body.appendChild(mockButton);

      act(() => {
        ReactDOM.render(<manager.MediaModalPortal />, container);
      });

      act(() => {
        manager.open(mockButton);
      });

      const closeButton = document.querySelector('button[aria-label="Close media preview"]');
      expect(closeButton).toBeNull();

      document.body.removeChild(mockButton);
    });

    it('ignores interaction if image is missing', () => {
      const mockButton = document.createElement('button');
      mockButton.className = 'image-button-wrapper';

      const mountContainer = document.createElement('div');
      document.body.appendChild(mountContainer);
      manager.mount(mountContainer);
      mountContainer.appendChild(mockButton);

      const openSpy = jest.spyOn(manager, 'open');

      act(() => {
        const clickEvent = new (window as any).MouseEvent('click', { bubbles: true });
        mockButton.dispatchEvent(clickEvent);
      });

      expect(openSpy).not.toHaveBeenCalled();

      manager.unmount();
      document.body.removeChild(mountContainer);
    });

    it('mounts to a different container correctly', () => {
      const mountContainer1 = document.createElement('div');
      const mountContainer2 = document.createElement('div');
      document.body.appendChild(mountContainer1);
      document.body.appendChild(mountContainer2);

      manager.mount(mountContainer1);
      const detachSpy = jest.spyOn(mountContainer1, 'removeEventListener');

      manager.mount(mountContainer2);
      expect(detachSpy).toHaveBeenCalled();

      manager.unmount();
      document.body.removeChild(mountContainer1);
      document.body.removeChild(mountContainer2);
    });
  });
});
