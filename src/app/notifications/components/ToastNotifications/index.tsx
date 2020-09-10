import { flow } from 'lodash';
import React from 'react';
import { connect } from 'react-redux';
import { mobileToolbarOpen } from '../../../content/search/selectors';
import { AppState } from '../../../types';
import { dismissNotification } from '../../actions';
import * as select from '../../selectors';
import { ToastNotification } from '../../types';
import { ToastContainerWrapper, ToastsContainer } from './styles';
import Toast from './Toast';

interface Props {
  dismiss: (toast: ToastNotification) => void;
  toasts: ToastNotification[];
  mobileToolbarOpen: boolean;
}

// tslint:disable-next-line:variable-name
const ToastNotifications = (props: Props) => {
  return props.toasts.length ? <ToastContainerWrapper mobileToolbarOpen={props.mobileToolbarOpen}>
    <ToastsContainer>
      {props.toasts.map((toast) => <Toast
        key={toast.messageKey}
        dismiss={() => props.dismiss(toast)}
        notification={toast}
      />)}
    </ToastsContainer>
  </ToastContainerWrapper> : null;
};

export default connect(
  (state: AppState) => ({
    mobileToolbarOpen: mobileToolbarOpen(state),
    toasts: select.toastNotifications(state),
  }),
  (dispatch) => ({
    dismiss: flow(dismissNotification, dispatch),
  })
)(ToastNotifications);
