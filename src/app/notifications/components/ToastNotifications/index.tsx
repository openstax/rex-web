import { flow } from 'lodash';
import React from 'react';
import { connect } from 'react-redux';
import { mobileToolbarOpen } from '../../../content/search/selectors';
import { useServices } from '../../../context/Services';
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
  const [shouldRender, setShouldRender] = React.useState(false);
  const services = useServices();

  React.useEffect(() => {
    services.promiseCollector.calm().then(() => setShouldRender(true));
  }, [services]);

  return shouldRender && props.toasts.length ? <ToastContainerWrapper mobileToolbarOpen={props.mobileToolbarOpen}>
    <ToastsContainer>
      {props.toasts.map((toast, index) => <Toast
        key={toast.messageKey}
        dismiss={() => props.dismiss(toast)}
        notification={toast}
        positionProps={{index, totalToastCount: props.toasts.length}}
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
