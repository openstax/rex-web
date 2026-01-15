import React from 'react';
import styled from 'styled-components/macro';
import ScrollLock from '../../../components/ScrollLock';
import { HTMLButtonElement } from '@openstax/types/lib.dom';
import theme from '../../../theme';

const buttonHeight = 4.2; // rem
const buttonMargin = 0.5; // rem

const ScrollableContent = styled.div`
  background: white;
  max-width: 100vw;
  max-height: calc(100vh - ${(buttonHeight + buttonMargin * 2) * 2}rem);
  overflow: auto;

  > img {
    ${/*
      fix ScrollableContent height issue where it is slightly larger than
      the image and leaves a gap at the bottom */ ''}
    display: block;
  }
`;


const FloatingCloseButton = styled.button`
  position: absolute;
  top: -${buttonHeight + buttonMargin}rem;
  right: ${buttonMargin}rem;
  z-index: 10;
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  width: ${buttonHeight}rem;
  height: ${buttonHeight}rem;
`;

const ContentContainer = styled.div`
  position: relative;
  pointer-events: auto;
`;

const ModalWrapper = styled.div`
  position: fixed;
  inset: 0;
  overflow: hidden;
  z-index: ${theme.zIndex.highlightSummaryPopup + 1};
  display: flex;
  justify-content: center;
  align-items: center;
  pointer-events: none;
`;


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
const MediaModal: React.FC<MediaModalProps> = ({ isOpen, onClose, children }) => {
  const closeButtonRef = React.useRef<HTMLButtonElement>(null);

  React.useEffect(() => {
    if (isOpen) {
      closeButtonRef.current?.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      <ScrollLock
        onClick={onClose}
        overlay={true}
        zIndex={theme.zIndex.highlightSummaryPopup}
      />
      <ModalWrapper aria-modal='true' role='dialog'>
        <ContentContainer >
          <FloatingCloseButton ref={closeButtonRef} onClick={onClose} aria-label='Close media preview'>
            <CloseIcon />
          </FloatingCloseButton>
          <ScrollableContent>{children}</ScrollableContent>
        </ContentContainer>
      </ModalWrapper>
    </>
  );
};

export default MediaModal;
