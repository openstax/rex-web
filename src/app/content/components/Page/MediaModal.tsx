import React from 'react';
import styled from 'styled-components/macro';

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.85);
  z-index: 1000;
  display: flex;
  justify-content: center;
  align-items: center;
`;


const Modal = styled.div`
  background: white;
  border-radius: 8px;
  width: 100%;
  min-width: 100vw;
  max-height: 90vh;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
`;

const ScrollableContent = styled.div`
  overflow-y: auto;
  flex: 1;
  padding: 1rem;
  display: block;
  width: 100%;
  box-sizing: border-box;
`;

const FloatingCloseButton = styled.button`
  position: absolute;
  top: -3rem;
  right: 2.5rem;
  z-index: 10;
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  width: 2.5rem;
  height: 2.5rem;
  transform: translateY(-3rem);
`;

const ModalWrapper = styled.div`
  position: relative;
  max-width: 100vw;
  width: 100%;
  box-sizing: border-box;
`;

const CloseIcon = () => (
  <svg width="42" height="42" viewBox="0 0 42 42" xmlns="http://www.w3.org/2000/svg">
    <rect x="1" y="1" width="40" height="40" rx="20" stroke="white" fill="none" />
    <line x1="16" y1="16" x2="26" y2="26" stroke="white" strokeWidth="2" strokeLinecap="round" />
    <line x1="26" y1="16" x2="16" y2="26" stroke="white" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

interface MediaModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const MediaModal: React.FC<MediaModalProps> = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <>
      <Overlay onClick={onClose}>
        <ModalWrapper onClick={onClose}>
          <FloatingCloseButton onClick={onClose}>
            <CloseIcon />
          </FloatingCloseButton>
          <Modal>
            <ScrollableContent>{children}</ScrollableContent>
          </Modal>
        </ModalWrapper>
      </Overlay>
    </>
  );
};

export default MediaModal;
