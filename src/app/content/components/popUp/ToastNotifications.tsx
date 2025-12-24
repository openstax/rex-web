import React from 'react';
import styled from 'styled-components/macro';
import ToastNotifications from '../../../notifications/components/ToastNotifications';
import { ToastNotification } from '../../../notifications/types';

const PopUpToastNotificationsWrapper = styled.div`
  position: sticky;
  top: 0;
  overflow: visible;
  z-index: 3;
  width: 100%;
`;

const PopUpToastNotifications = (props: {toasts?: ToastNotification[]}) => props.toasts
  ? <PopUpToastNotificationsWrapper>
      <ToastNotifications toasts={props.toasts} />
    </PopUpToastNotificationsWrapper>
  : null;

export default PopUpToastNotifications;
