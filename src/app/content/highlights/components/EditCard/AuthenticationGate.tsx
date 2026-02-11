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
import { HTMLElement } from '@openstax/types/lib.dom';
import { mergeRefs, assertWindow } from '../../../../utils';

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

export function LoginConfirmation({
  onBlur,
}: {
  onBlur: typeof clearFocusedHighlight;
}) {
  const loginLink = useSelector(selectAuth.loginLink);
  const trackShowLogin = useAnalyticsEvent('showLogin');

  React.useEffect(() => {
    trackShowLogin();
  }, [trackShowLogin]);

  const onCancel = React.useCallback(() => {
    onBlur();
    assertWindow().getSelection()?.removeAllRanges();
  }, [onBlur]);

  return (
    <Confirmation
      data-analytics-label='login'
      data-analytics-region='highlighting-login'
      message='i18n:highlighting:login:prompt'
      confirmMessage='i18n:highlighting:login:link'
      confirmLink={loginLink}
      onCancel={onCancel}
      drawFocus={false}
    />
  );
}

// tslint:disable-next-line:variable-name
export const HiddenOnMobile = styled.div`
  min-width: ${cardWidth}rem;
  ${theme.breakpoints.touchDeviceQuery(css`
    display: none;
  `)}
`;
