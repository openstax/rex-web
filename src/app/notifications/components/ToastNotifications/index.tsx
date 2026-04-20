import orderBy from 'lodash/orderBy';
import React from 'react';
import { useDispatch } from 'react-redux';
import { assertDefined } from '../../../utils';
import { dismissNotification } from '../../actions';
import { ToastNotification } from '../../types';
import Toast from './Toast';

// Note: ToastNotifications.css is imported globally from src/app/index.tsx to ensure
// consistent CSS ordering across code-split chunks

interface Props {
  toasts: ToastNotification[];
}

const ToastNotifications = ({toasts}: Props) => {
  const dispatch = useDispatch();

  const sortedToasts = new Map(orderBy(toasts, ['timestamp'], ['desc']).map((toast, index) => [toast, index]));

  return toasts.length ? <div className="toasts-container">
      {toasts.map((toast) => <Toast
        key={toast.messageKey + toast.errorId}
        dismiss={() => dispatch(dismissNotification(toast))}
        notification={toast}
        positionProps={{
          index: assertDefined(sortedToasts.get(toast), 'Notification dissapeared'),
          totalToastCount: toasts.length,
        }}
        variant={toast.variant}
      />)}
    </div> : null;
};

export default ToastNotifications;
