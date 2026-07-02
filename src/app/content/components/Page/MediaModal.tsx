import React from 'react';
import classNames from 'classnames';
import ScrollLock from '../../../components/ScrollLock';
import { HTMLButtonElement, HTMLDivElement } from '@openstax/types/lib.dom';
import { useTrapTabNavigation } from '../../../reactUtils';
import theme from '../../../theme';
import './MediaModal.css';

const buttonHeight = 4.2; // rem
const buttonMargin = 0.5; // rem

const CloseIcon = () => (
  <svg width='42' height='42' viewBox='0 0 42 42' xmlns='http://www.w3.org/2000/svg'>
    <rect x='1' y='1' width='40' height='40' rx='20' stroke='white' fill='none' />
    <line x1='16' y1='16' x2='26' y2='26' stroke='white' strokeWidth='2' strokeLinecap='round' />
    <line x1='26' y1='16' x2='16' y2='26' stroke='white' strokeWidth='2' strokeLinecap='round' />
  </svg>
);

interface MediaModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

/**
 * MediaModal component - Full-screen modal for displaying enlarged media
 *
 * Migrated from styled-components to plain CSS.
 */
function MediaModal({ isOpen, onClose, children }: MediaModalProps) {
  const closeButtonRef = React.useRef<HTMLButtonElement>(null);
  const wrapperRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (isOpen) {
      closeButtonRef.current?.focus();
    }
  }, [isOpen]);

  useTrapTabNavigation(wrapperRef, isOpen);

  if (!isOpen) return null;

  const scrollableMaxHeight = `calc(100vh - ${(buttonHeight + buttonMargin * 2) * 2}rem)`;
  const closeButtonTop = `-${buttonHeight + buttonMargin}rem`;

  return (
    <>
      <ScrollLock
        onClick={onClose}
        overlay={true}
        zIndex={theme.zIndex.highlightSummaryPopup}
      />
      <div
        ref={wrapperRef}
        className={classNames('media-modal-wrapper')}
        aria-modal='true'
        role='dialog'
        aria-label='Enlarged media'
        style={{
          '--modal-z-index': theme.zIndex.highlightSummaryPopup + 1,
          '--scrollable-max-height': scrollableMaxHeight,
          '--button-height': `${buttonHeight}rem`,
          '--button-margin': `${buttonMargin}rem`,
          '--close-button-top': closeButtonTop,
        } as React.CSSProperties}
      >
        <div className={classNames('media-modal-content-container')}>
          <button
            ref={closeButtonRef}
            onClick={onClose}
            aria-label='Close media preview'
            className={classNames('media-modal-close-button')}
          >
            <CloseIcon />
          </button>
          <div className={classNames('media-modal-scrollable-content')}>{children}</div>
        </div>
      </div>
    </>
  );
}

export default MediaModal;
