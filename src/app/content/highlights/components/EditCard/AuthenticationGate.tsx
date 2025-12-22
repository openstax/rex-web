/**
 * AuthenticationGate Component
 *
 * Handles authentication requirements for the EditCard component.
 * Displays a login prompt for unauthenticated users, or renders
 * the editing interface for authenticated users.
 *
 * This separation allows the authentication concern to be tested
 * and maintained independently from the editing logic.
 */

import React from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useSelector } from 'react-redux';
import styled, { css } from 'styled-components/macro';
import * as selectAuth from '../../../../auth/selectors';
import { useAnalyticsEvent } from '../../../../../helpers/analytics';
import { clearFocusedHighlight } from '../../actions';
import { cardWidth } from '../../constants';
import Confirmation from '../Confirmation';
import theme from '../../../../theme';
import { mergeRefs } from '../../../../utils';

/**
 * Props for the LoginOrEdit component
 */
interface LoginOrEditProps {
  children: React.ReactNode;
  className: string;
  isNewSelection: boolean;
  shouldFocusCard: boolean;
  hasAnnotation: boolean;
  onBlur: typeof clearFocusedHighlight;
  fref: React.ForwardedRef<HTMLElement>;
  elementRef: React.RefObject<HTMLElement>;
}

/**
 * LoginOrEdit - Main authentication gate component
 *
 * Renders either:
 * - LoginConfirmation for unauthenticated users
 * - HiddenOnMobile with editing interface for authenticated users
 *
 * @param props - Component props including authentication state and refs
 */
export function LoginOrEdit({
  children,
  className,
  isNewSelection,
  shouldFocusCard,
  hasAnnotation,
  onBlur,
  fref,
  elementRef,
}: LoginOrEditProps) {
  const authenticated = !!useSelector(selectAuth.user);
  const { formatMessage } = useIntl();

  // Handler to show the card when user clicks on the button.
  // Uses preventDefault to avoid focus changes and dispatches
  // a custom event that the parent component listens for.
  const showCard = React.useCallback((event: React.MouseEvent) => {
    if (event.button === 0) {
      event.preventDefault();
      document?.dispatchEvent(new CustomEvent('showCardEvent', { bubbles: true }));
    }
  }, []);

  return (
    <div
      className={className}
      role='dialog'
      aria-label={formatMessage({ id: 'i18n:highlighter:edit-note:label' })}
    >
      {authenticated ? (
        <HiddenOnMobile>
          {shouldFocusCard || hasAnnotation ? (
            <form
              ref={mergeRefs(fref, elementRef)}
              data-analytics-region='edit-note'
              data-highlight-card
            >
              {children}
            </form>
          ) : (
            <button type='button' onMouseDown={showCard}>
              <FormattedMessage
                id={
                  isNewSelection
                    ? 'i18n:highlighting:create-instructions'
                    : 'i18n:highlighting:instructions'
                }
              />
            </button>
          )}
        </HiddenOnMobile>
      ) : (
        <LoginConfirmation onBlur={onBlur} />
      )}
    </div>
  );
}

/**
 * LoginConfirmation - Component shown to unauthenticated users
 *
 * Displays a confirmation dialog prompting the user to log in
 * to use highlighting features. Tracks analytics when shown.
 *
 * @param props - Component props including onBlur callback
 */
export function LoginConfirmation({
  onBlur,
}: {
  onBlur: typeof clearFocusedHighlight;
}) {
  const loginLink = useSelector(selectAuth.loginLink);
  const trackShowLogin = useAnalyticsEvent('showLogin');

  // Track analytics event when login prompt is shown
  React.useEffect(() => {
    trackShowLogin();
  }, [trackShowLogin]);

  return (
    <Confirmation
      data-analytics-label='login'
      data-analytics-region='highlighting-login'
      message='i18n:highlighting:login:prompt'
      confirmMessage='i18n:highlighting:login:link'
      confirmLink={loginLink}
      onCancel={onBlur}
      drawFocus={false}
    />
  );
}

/**
 * HiddenOnMobile - Styled component that hides content on touch devices
 *
 * The EditCard is only displayed on desktop/laptop devices with a mouse.
 * On mobile devices, highlighting uses a different interaction pattern.
 */
// tslint:disable-next-line:variable-name
export const HiddenOnMobile = styled.div`
  min-width: ${cardWidth}rem;
  ${theme.breakpoints.touchDeviceQuery(css`
    display: none;
  `)}
`;
