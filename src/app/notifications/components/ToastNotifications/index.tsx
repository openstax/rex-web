import { flow } from 'lodash';
import React from 'react';
import { connect } from 'react-redux';
import { AppState } from '../../../types';
import { dismissNotification } from '../../actions';
import * as select from '../../selectors';
import { ToastNotification } from '../../types';
import Toast from './Toast';

interface Props {
  dismiss: (toast: ToastNotification) => void;
  toasts: ToastNotification[];
}

// tslint:disable-next-line:variable-name
const ToastNotifications = (props: Props) => {
  return <>
    {props.toasts.map((toast) => <Toast
      key={toast.message}
      dismiss={() => props.dismiss(toast)}
      notification={toast}
    />)}
  </>;
};

export default connect(
  (state: AppState) => ({
    toasts: select.toastNotifications(state),
  }),
  (dispatch) => ({
    dismiss: flow(dismissNotification, dispatch),
  })
)(ToastNotifications);
