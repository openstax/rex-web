import React from 'react';
import styled from 'styled-components/macro';
import { ToastData, ToastContainer } from '@openstax/ui-components';
import { hiddenButAccessible } from '../../theme';

const HiddenLiveRegion = styled.div`
  ${hiddenButAccessible}
`;

interface ConfirmationToastContextValue {
  showToast: (data: ConfirmationToastData) => void;
  announcement: { message: string; key: number };
}

const ctx = React.createContext<ConfirmationToastContextValue>({
  showToast: () => undefined,
  announcement: { message: '', key: 0 },
});
const defaultToastData: Omit<ToastData, 'message'> = {
  title: '',
  variant: 'success',
  dismissAfterMs: 5000,
};
type ConfirmationToastData = Partial<ToastData> & Pick<ToastData, 'message'>;

function useConfirmationToastContext() {
  return React.useContext(ctx).showToast;
}

/**
 * Renders a visually-hidden aria-live region that mirrors toast messages.
 * Place inside aria-modal dialogs so screen readers announce toasts
 * that would otherwise be suppressed by the modal boundary.
 */
function ModalToastAnnouncer() {
  const { announcement } = React.useContext(ctx);
  const [liveMsg, setLiveMsg] = React.useState('');

  React.useEffect(() => {
    if (!announcement.message) { return; }
    setLiveMsg('');
    const timer = setTimeout(() => setLiveMsg(announcement.message), 100);
    return () => clearTimeout(timer);
  }, [announcement]);

  return (
    <HiddenLiveRegion aria-live='polite'>
      {liveMsg}
    </HiddenLiveRegion>
  );
}

function ConfirmationToastProvider({ children }: React.PropsWithChildren<{}>) {
  const [toastData, setToastData] = React.useState<ToastData[]>([]);
  const [announcement, setAnnouncement] = React.useState({ message: '', key: 0 });
  const showToast = React.useCallback(
    (data: ConfirmationToastData) => {
      setToastData([
        {
          ...defaultToastData,
          ...data,
          onDismiss() {
            setToastData([]);
          },
        },
      ]);
      setAnnouncement((prev) => ({ message: data.message as string, key: prev.key + 1 }));
    },
    []
  );

  const value = React.useMemo(
    () => ({ showToast, announcement }),
    [showToast, announcement]
  );

  return (
    <ctx.Provider value={value}>
      <ToastContainer toasts={toastData} />
      {children}
    </ctx.Provider>
  );
}

export { useConfirmationToastContext, ConfirmationToastProvider, ModalToastAnnouncer };
