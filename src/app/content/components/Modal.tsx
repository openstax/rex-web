import { HTMLElement } from '@openstax/types/lib.dom';
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
export const ModalContext = React.createContext<{focusModal: () => void}>({focusModal: () => undefined});

// tslint:disable-next-line: variable-name
const ModalWithScrollLock = React.forwardRef<HTMLElement, ModalWithScrollLockProps>(
  ({ children, scrollLockProps, ...props }: ModalWithScrollLockProps, ref: React.Ref<HTMLElement>) => {
  const focusModal = () => {
    // Does not work for function refs but we don't use those
    if (typeof ref !== 'function' && ref?.current) { ref.current.focus(); }
  };

  return createPortal(
    <PopupWrapper>
      <ScrollLock {...scrollLockProps} />
      <ModalWrapper ref={ref} {...props}>
        <ModalContext.Provider value={{focusModal}}>
          {children}
        </ModalContext.Provider>
      </ModalWrapper>
    </PopupWrapper>,
    assertDocument().body
  );
});

export default ModalWithScrollLock;
