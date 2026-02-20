import { HTMLElement } from '@openstax/types/lib.dom';
import React from 'react';
import ReactDOM from 'react-dom';
import { act } from 'react-dom/test-utils';
import renderer from 'react-test-renderer';
import { ConfirmationToastProvider, ModalToastAnnouncer, useConfirmationToastContext } from './ConfirmationToast';
import TestContainer from '../../../test/TestContainer';
import { assertDocument } from '../../utils';

function findAnnouncerLiveRegion(root: HTMLElement): HTMLElement {
  // ModalToastAnnouncer uses StyledHiddenLiveRegion (position: absolute, 1px x 1px).
  // ToastContainer also has aria-live="polite". Select the last one, which is the announcer.
  const regions = Array.from(
    root.querySelectorAll<HTMLElement>('[aria-live="polite"]')
  );
  return regions[regions.length - 1];
}

describe('ConfirmationToast', () => {
  describe('ModalToastAnnouncer', () => {
    let container: HTMLElement;

    beforeEach(() => {
      container = assertDocument().createElement('div');
      assertDocument().body.appendChild(container);
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
      ReactDOM.unmountComponentAtNode(container);
      container.remove();
    });

    const Trigger = () => {
      const showToast = useConfirmationToastContext();
      return <button onClick={() => showToast({ message: 'Highlight saved' })}>Save</button>;
    };

    it('renders empty live region initially', () => {
      act(() => {
        ReactDOM.render(
          <TestContainer>
            <ConfirmationToastProvider>
              <ModalToastAnnouncer />
            </ConfirmationToastProvider>
          </TestContainer>,
          container
        );
      });

      const liveRegion = findAnnouncerLiveRegion(container);
      expect(liveRegion).toBeTruthy();
      expect(liveRegion.textContent).toBe('');
    });

    it('announces toast message after delay', () => {
      act(() => {
        ReactDOM.render(
          <TestContainer>
            <ConfirmationToastProvider>
              <Trigger />
              <ModalToastAnnouncer />
            </ConfirmationToastProvider>
          </TestContainer>,
          container
        );
      });

      act(() => {
        container.querySelector('button')!.click();
      });

      act(() => {
        jest.advanceTimersByTime(150);
      });

      const liveRegion = findAnnouncerLiveRegion(container);
      expect(liveRegion.textContent).toBe('Highlight saved');
    });

    it('clears and re-announces on repeated toasts', () => {
      act(() => {
        ReactDOM.render(
          <TestContainer>
            <ConfirmationToastProvider>
              <Trigger />
              <ModalToastAnnouncer />
            </ConfirmationToastProvider>
          </TestContainer>,
          container
        );
      });

      // First toast
      act(() => {
        container.querySelector('button')!.click();
      });
      act(() => {
        jest.advanceTimersByTime(150);
      });

      const liveRegion = findAnnouncerLiveRegion(container);
      expect(liveRegion.textContent).toBe('Highlight saved');

      // Second toast (same message) — should clear then re-announce
      act(() => {
        container.querySelector('button')!.click();
      });

      expect(liveRegion.textContent).toBe('');

      act(() => {
        jest.advanceTimersByTime(150);
      });

      expect(liveRegion.textContent).toBe('Highlight saved');
    });
  });

  describe('useConfirmationToastContext', () => {
    it('returns a no-op function when used outside provider', () => {
      const Consumer = () => {
        const showToast = useConfirmationToastContext();
        showToast({ message: 'test' });
        return <div>ok</div>;
      };

      expect(() => {
        renderer.create(
          <TestContainer>
            <Consumer />
          </TestContainer>
        );
      }).not.toThrow();
    });
  });
});
