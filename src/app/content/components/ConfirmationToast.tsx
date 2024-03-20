import React from 'react';
import { ToastData, ToastContainer } from '@openstax/ui-components';

const ctx = React.createContext({});
const defaultToastData: Omit<ToastData, 'message'> = {
  title: '',
  variant: 'success',
  dismissAfterMs: 4000,
};
type ConfirmationToastData = Partial<ToastData> & Pick<ToastData, 'message'>;

function useConfirmationToastContext() {
  return React.useContext(ctx) as (data: ConfirmationToastData) => void;
}

function ConfirmationToastProvider({ children }: React.PropsWithChildren<{}>) {
  const [toastData, setToastData] = React.useState<ToastData[]>([]);
  const showToast = React.useCallback(
    (data: ConfirmationToastData) =>
      setToastData([
        {
          ...defaultToastData,
          ...data,
          onDismiss() {
            setToastData([]);
          },
        },
      ]),
    []
  );

  return (
    <ctx.Provider value={showToast}>
      <ToastContainer toasts={toastData} />
      {children}
    </ctx.Provider>
  );
}

export { useConfirmationToastContext, ConfirmationToastProvider };
