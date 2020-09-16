import orderBy from 'lodash/orderBy';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { assertDefined } from '../../../utils';
import { dismissNotification } from '../../actions';
import * as select from '../../selectors';
import { ToastsContainer } from './styles';
import Toast from './Toast';

// tslint:disable-next-line:variable-name
const ToastNotifications = (props: {className?: string}) => {
  const dispatch = useDispatch();
  const toasts = useSelector(select.toastNotifications);

  const sortedToasts = new Map(orderBy(toasts, ['timestamp'], ['desc']).map((toast, index) => [toast, index]));

  return toasts.length ? <div className={props.className}>
    <ToastsContainer>
      {toasts.map((toast) => <Toast
        key={toast.messageKey}
        dismiss={() => dispatch(dismissNotification(toast))}
        notification={toast}
        positionProps={{
          index: assertDefined(sortedToasts.get(toast), 'Notification dissapeared'),
          totalToastCount: toasts.length,
        }}
      />)}
    </ToastsContainer>
  </div> : null;
};

export default ToastNotifications;
