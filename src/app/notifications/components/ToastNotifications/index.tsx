import orderBy from 'lodash/orderBy';
import React from 'react';
import { useDispatch } from 'react-redux';
import { assertDefined } from '../../../utils';
import { dismissNotification } from '../../actions';
import { ToastNotification } from '../../types';
import { ToastsContainer } from './styles';
import Toast from './Toast';

interface Props {
  toasts: ToastNotification[];
}

// tslint:disable-next-line:variable-name
const ToastNotifications = ({toasts}: Props) => {
  const dispatch = useDispatch();

  const sortedToasts = new Map(orderBy(toasts, ['timestamp'], ['desc']).map((toast, index) => [toast, index]));

  return toasts.length ? <ToastsContainer>
      {toasts.map((toast) => <Toast
        key={toast.messageKey + toast.errorId}
        dismiss={() => dispatch(dismissNotification(toast))}
        notification={toast}
        positionProps={{
          index: assertDefined(sortedToasts.get(toast), 'Notification dissapeared'),
          totalToastCount: toasts.length,
        }}
      />)}
    </ToastsContainer> : null;
};

export default ToastNotifications;
