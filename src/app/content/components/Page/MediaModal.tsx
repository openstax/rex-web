import React from 'react';
import styled from 'styled-components/macro';

const Overlay = styled.div`
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
`;

const ModalContainer = styled.div`
  background-color: white;
  padding: 1rem;
  margin: 2rem;
  border-radius: 1rem;
  max-width: 90%;
  max-height: 90%;
  overflow: auto;
`;


interface MediaModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const MediaModal: React.FC<MediaModalProps> = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <Overlay onClick={onClose}>
      <ModalContainer onClick={onClose}>
        <div>{children}</div>
      </ModalContainer>
    </Overlay>
  );
};

export default MediaModal;
