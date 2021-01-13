import React, { RefObject } from 'react';
import { createPortal } from 'react-dom';
import { StyledComponentProps } from 'styled-components/macro';
import ScrollLock from '../../components/ScrollLock';
import { assertDocument } from '../../utils/browser-assertions';
import { Modal as ModalWrapper, PopupWrapper } from '../styles/PopupStyles';

interface ModalWithScrollLockProps extends StyledComponentProps<'div', {}, {}, ''> {
  scrollLockProps: React.ComponentProps<typeof ScrollLock>;
}

// tslint:disable-next-line: variable-name
const ModalWithScrollLock = React.forwardRef(
  ({ children, scrollLockProps, ...props }: ModalWithScrollLockProps, ref) => {
  return createPortal(
    <PopupWrapper>
      <ScrollLock {...scrollLockProps} />
      <ModalWrapper ref={ref as RefObject<any>} {...props}>
        {children}
      </ModalWrapper>
    </PopupWrapper>,
    assertDocument().body
  );
});

export default ModalWithScrollLock;
