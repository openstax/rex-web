import React from 'react';
import { createPortal } from 'react-dom';
import { StyledComponentProps } from 'styled-components/macro';
import ScrollLock from '../../components/ScrollLock';
import { assertDocument } from '../../utils/browser-assertions';
import { Modal as ModalWrapper, PopupWrapper } from '../styles/PopupStyles';

interface ModalWithScrollLockProps extends StyledComponentProps<'div', {}, {}, ''> {
  scrollLockProps: React.ComponentProps<typeof ScrollLock>;
}

// tslint:disable-next-line: variable-name
const ModalWithScrollLock = React.forwardRef<HTMLDivElement, ModalWithScrollLockProps>(
  ({ children, scrollLockProps, ...props }: ModalWithScrollLockProps, ref) => {
  return createPortal(
    <PopupWrapper role='dialog' aria-modal='true' aria-labelledby='modal-title'>
      <ScrollLock {...scrollLockProps} />
      <ModalWrapper ref={ref} {...props}>
        {children}
      </ModalWrapper>
    </PopupWrapper>,
    assertDocument().body
  );
});

export default ModalWithScrollLock;
