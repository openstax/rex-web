import classNames from 'classnames';
import React from 'react';
import ToastNotifications from '../../../notifications/components/ToastNotifications';
import { ToastNotification } from '../../../notifications/types';
import './ToastNotifications.css';

interface PopUpToastNotificationsWrapperProps extends React.HTMLAttributes<HTMLDivElement> {
  theme?: unknown;
}

/**
 * PopUpToastNotificationsWrapper component - plain CSS version
 */
export function PopUpToastNotificationsWrapper(
  { className, theme: _theme, ...props }: PopUpToastNotificationsWrapperProps
) {
  // Destructure theme to remove it, preventing it from being passed to the DOM

  return (
    <div
      {...props}
      className={classNames('popup-toast-notifications-wrapper', className)}
    />
  );
}

/**
 * PopUpToastNotifications - Popup-specific wrapper for toast notifications
 */
export function PopUpToastNotifications(props: {toasts?: ToastNotification[]}) {
  return props.toasts ? (
    <PopUpToastNotificationsWrapper>
      <ToastNotifications toasts={props.toasts} />
    </PopUpToastNotificationsWrapper>
  ) : null;
}

export default PopUpToastNotifications;
