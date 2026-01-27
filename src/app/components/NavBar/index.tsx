import React, { FunctionComponent, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { connect } from 'react-redux';
import { Dialog } from 'react-aria-components';
import { ProfileMenu, ProfileMenuButton, UserIcon } from '@openstax/ui-components';
import openstaxLogo from '../../../assets/logo.svg';
import * as authSelect from '../../auth/selectors';
import * as selectHighlights from '../../content/highlights/selectors';
import { User } from '../../auth/types';
import * as selectNavigation from '../../navigation/selectors';
import { AppState } from '../../types';
import * as Styled from './styled';
import * as guards from '../../guards';
import showConfirmation from '../../content/highlights/components/utils/showConfirmation';
import { useServices } from '../../context/Services';
import { assertWindow } from '../../utils';
import { useMatchMobileQuery } from '../../reactUtils';

export { maxNavWidth, navDesktopHeight, navMobileHeight } from './styled';

if (typeof(window) !== 'undefined') {
  import(/* webpackChunkName: "focus-within-polyfill" */ 'focus-within-polyfill');
}

export const useUnsavedHighlightsValidator = (hasUnsavedHighlight: boolean) => {
  const services = useServices();
  return async(e: React.MouseEvent, url: string) => {
    if (hasUnsavedHighlight) {
      e.preventDefault();
      const window = assertWindow();
      const confirmed = await showConfirmation(services);
      if (confirmed) {
        window.location.assign(url);
      }
    }
  };
};

export const MobileDropdown: FunctionComponent<{
  user: User,
  currentPath: string,
  onAction: (key: React.Key) => void,
  isOpen: boolean,
  onClose: () => void
}> = ({user, currentPath, onAction, isOpen, onClose}) => {
  const intl = useIntl();

  return (
    <Styled.MobileMenuOverlay isOpen={isOpen} onOpenChange={(open: boolean) => !open && onClose()}>
      <Styled.MobileMenuModal>
        <Dialog aria-label={intl.formatMessage({ id: 'i18n:nav:hello:text' }, { name: user.firstName })}>
          <Styled.DropdownOverlay data-testid='nav-overlay'>
            <a aria-hidden='true' tabIndex={-1} href='/'>
              <Styled.OverlayLogo
                src={openstaxLogo}
                alt={intl.formatMessage({ id: 'i18n:nav:logo:alt' })}
              />
            </a>
            <Styled.TimesIcon onClick={onClose} />
            <div>
              <FormattedMessage
                id='i18n:nav:hello:text'
                values={{ name: user.firstName }}
              >
                {msg => <Styled.OverlayHeading>{msg}</Styled.OverlayHeading>}
              </FormattedMessage>
              <Styled.DropdownList id='dropdown-menu' role='menu'>
                <li role='presentation'>
                  <FormattedMessage id='i18n:nav:profile:text'>
                    {msg => (
                      <a
                        href='/accounts/profile'
                        target='_blank'
                        role='menuitem'
                        onClick={() => onAction('profile')}
                      >
                        {msg}
                      </a>
                    )}
                  </FormattedMessage>
                </li>
                <li role='presentation'>
                  <FormattedMessage id='i18n:nav:logout:text'>
                    {msg => (
                      <a
                        href={'/accounts/logout?r=' + currentPath}
                        role='menuitem'
                        onClick={(e) => {
                          e.preventDefault();
                          onAction('logout');
                        }}
                      >
                        {msg}
                      </a>
                    )}
                  </FormattedMessage>
                </li>
              </Styled.DropdownList>
            </div>
          </Styled.DropdownOverlay>
        </Dialog>
      </Styled.MobileMenuModal>
    </Styled.MobileMenuOverlay>
  );
};

const LoggedInState: FunctionComponent<{
  user: User;
  currentPath: string;
  hasUnsavedHighlight: boolean;
}> = ({
  user,
  currentPath,
  hasUnsavedHighlight,
}) => {
  const services = useServices();
  const intl = useIntl();
  const isMobile = useMatchMobileQuery();
  const [overlayOpen, setOverlayOpen] = useState(false);

  const handleAction = async(key: React.Key) => {
    if (key === 'profile') {
      assertWindow().open('/accounts/profile', '_blank');
    } else if (key === 'logout') {
      const logOutUrl = '/accounts/logout?r=' + currentPath;
      if (hasUnsavedHighlight) {
        const confirmed = await showConfirmation(services);
        if (confirmed) {
          assertWindow().location.assign(logOutUrl);
        }
      } else {
        assertWindow().location.assign(logOutUrl);
      }
    }
    setOverlayOpen(false);
  };

  // On mobile, render just a button that opens the full-screen overlay
  // On desktop, render ProfileMenu with its popover
  if (isMobile) {
    return (
      <Styled.DropdownContainer data-testid='user-nav'>
        <ProfileMenuButton
          onPress={() => setOverlayOpen(true)}
          data-testid='user-nav-toggle'
          aria-label='account actions'
          aria-expanded={overlayOpen}
        >
          {user.firstName && user.lastName
            ? (user.firstName[0] + user.lastName[0]).toUpperCase()
            : <UserIcon />
          }
        </ProfileMenuButton>
        <MobileDropdown
          user={user}
          currentPath={currentPath}
          onAction={handleAction}
          isOpen={overlayOpen}
          onClose={() => setOverlayOpen(false)}
        />
      </Styled.DropdownContainer>
    );
  }

  return (
    <Styled.DropdownContainer data-testid='user-nav'>
      <ProfileMenu
        user={user}
        onAction={handleAction}
        profileLabel={intl.formatMessage({ id: 'i18n:nav:profile:text' })}
        logoutLabel={intl.formatMessage({ id: 'i18n:nav:logout:text' })}
        data-testid='user-nav-toggle'
      />
    </Styled.DropdownContainer>
  );
};

const LoggedOutState: FunctionComponent<{currentPath: string}> = ({currentPath}) => <FormattedMessage id='i18n:nav:login:text'>
  {(msg) => <Styled.Link href={'/accounts/login?r=' + currentPath}
    data-testid='nav-login' data-analytics-label='login'> {msg}
  </Styled.Link>}
</FormattedMessage>;

export const ConnectedLoginButton = connect(
  (state: AppState) => ({
    currentPath: selectNavigation.pathname(state),
  })
)(LoggedOutState);

interface NavigationBarProps {
  user?: User;
  loggedOut: boolean;
  currentPath: string;
  params: unknown;
  hasUnsavedHighlight: boolean;
}
const NavigationBar = ({user, loggedOut, currentPath, hasUnsavedHighlight, params}: NavigationBarProps) => {
  const logoUrl = guards.isPortaled(params) ? `/${params.portalName}/` : '/';
  const unsavedHighlightsHandler = useUnsavedHighlightsValidator(hasUnsavedHighlight);
  const intl = useIntl();


  return (
    <Styled.BarWrapper data-analytics-region='openstax-navbar'>
      <Styled.TopBar data-testid='navbar'>
        <a
          href={logoUrl}
          onClick={(e) => unsavedHighlightsHandler(e, logoUrl)}
        >
          <Styled.HeaderImage
            role='img'
            src={openstaxLogo}
            alt={intl.formatMessage({id: 'i18n:nav:logo:alt'})}
          />
        </a>
        {loggedOut && <LoggedOutState currentPath={currentPath} />}
        {user && <LoggedInState user={user} currentPath={currentPath} hasUnsavedHighlight={hasUnsavedHighlight} />}
      </Styled.TopBar>
    </Styled.BarWrapper>
  );
};

export default connect(
  (state: AppState) => ({
    currentPath: selectNavigation.pathname(state),
    params: selectNavigation.params(state),
    loggedOut: authSelect.loggedOut(state),
    user: authSelect.user(state),
    hasUnsavedHighlight: selectHighlights.hasUnsavedHighlight(state),
  })
)(NavigationBar);
