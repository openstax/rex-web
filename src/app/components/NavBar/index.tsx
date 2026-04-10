import React, { FunctionComponent, useEffect, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useSelector } from 'react-redux';
import { Dialog, ModalOverlay, Modal } from 'react-aria-components';
import { ProfileMenu, ProfileMenuButton, ProfileMenuItem, UserIcon } from '@openstax/ui-components';
import classNames from 'classnames';
import Color from 'color';
import openstaxLogo from '../../../assets/logo.svg';
import * as authSelect from '../../auth/selectors';
import * as selectHighlights from '../../content/highlights/selectors';
import { User } from '../../auth/types';
import * as selectNavigation from '../../navigation/selectors';
import { AppState } from '../../types';
import * as guards from '../../guards';
import showConfirmation from '../../content/highlights/components/utils/showConfirmation';
import { useServices } from '../../context/Services';
import { assertWindow } from '../../utils';
import { useMatchMobileQuery } from '../../reactUtils';
import theme from '../../theme';
import Times from '../Times';
import './NavBar.css';

export { maxNavWidth, navDesktopHeight, navMobileHeight } from './constants';

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
  isOpen: boolean,
  onOpenChange: (isOpen: boolean) => void,
  onAction: (key: React.Key) => void
}> = ({user, currentPath, isOpen, onOpenChange, onAction}) => {
  const intl = useIntl();

  return (
    <ModalOverlay
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      className="navbar-mobile-menu-overlay"
      style={{
        '--mobile-overlay-bg': Color(theme.color.neutral.base).alpha(0.98).string(),
        '--mobile-overlay-z-index': theme.zIndex.navbar + 1,
      } as React.CSSProperties}
    >
      <Modal className="navbar-mobile-menu-modal">
        <Dialog aria-label={intl.formatMessage({ id: 'i18n:nav:hello:text' }, { name: user.firstName })}>
          <div className="navbar-dropdown-overlay" data-testid='nav-overlay'>
            <a aria-hidden='true' tabIndex={-1} href='/'>
              <img
                src={openstaxLogo}
                alt={intl.formatMessage({ id: 'i18n:nav:logo:alt' })}
                className="navbar-overlay-logo"
                style={{
                  '--navbar-logo-height-mobile': '2.8rem',
                  '--navbar-overlay-logo-top': '1.2rem',
                } as React.CSSProperties}
              />
            </a>
            <button
              type="button"
              aria-label='close menu'
              onClick={() => onOpenChange(false)}
              className="navbar-times-icon"
              style={{
                '--navbar-height-mobile': '5.2rem',
                '--nav-text-color': theme.color.primary.gray.base,
              } as React.CSSProperties}
            >
              <Times />
            </button>
            <div>
              <FormattedMessage
                id='i18n:nav:hello:text'
                values={{ name: user.firstName }}
              >
                {msg => <h4 className="navbar-overlay-heading" style={{
                  '--nav-text-color': theme.color.primary.gray.base,
                } as React.CSSProperties}>{msg}</h4>}
              </FormattedMessage>
              <menu
                id='dropdown-menu'
                role='menu'
                className="navbar-dropdown-list"
                style={{
                  '--nav-text-color': theme.color.primary.gray.base,
                  '--link-hover': '#0064a0',
                  '--focus-outline-color': '#007297',
                } as React.CSSProperties}
              >
                <li role='presentation'>
                  <FormattedMessage id='i18n:nav:profile:text'>
                    {msg => (
                      <a
                        href='/accounts/profile'
                        target='_blank'
                        rel='noopener noreferrer'
                        role='menuitem'
                        onClick={(e) => {
                          e.preventDefault();
                          onAction('profile');
                        }}
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
              </menu>
            </div>
          </div>
        </Dialog>
      </Modal>
    </ModalOverlay>
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
  const intl = useIntl();
  const isMobile = useMatchMobileQuery();
  const [overlayOpen, setOverlayOpen] = useState(false);
  const services = useServices();

  useEffect(() => {
    if (!isMobile) {
      setOverlayOpen(false);
    }
  }, [isMobile]);

  const handleAction = async(key: React.Key) => {
    if (key === 'profile') {
      const newWindow = assertWindow().open('/accounts/profile', '_blank', 'noopener,noreferrer');
      if (newWindow) {
        newWindow.opener = null;
      }
    }

    if (key === 'logout') {
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

  // On mobile, render only a button that opens the full-screen overlay
  // On desktop, render ProfileMenu with its popover
  if (isMobile) {
    return (
      <div className="navbar-dropdown-container" data-testid='user-nav'>
        <ProfileMenuButton
          onPress={() => setOverlayOpen(true)}
          data-testid='user-nav-toggle'
          aria-label='User profile'
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
          isOpen={overlayOpen}
          onOpenChange={setOverlayOpen}
          onAction={handleAction}
        />
      </div>
    );
  }

  return (
    <div className="navbar-dropdown-container" data-testid='user-nav'>
      <ProfileMenu
        user={user}
        onAction={handleAction}
        data-testid='user-nav-toggle'
      >
        <ProfileMenuItem id='profile'>
          {intl.formatMessage({ id: 'i18n:nav:profile:text' })}
        </ProfileMenuItem>
        <ProfileMenuItem id='logout'>
          {intl.formatMessage({ id: 'i18n:nav:logout:text' })}
        </ProfileMenuItem>
      </ProfileMenu>
    </div>
  );
};

const LoggedOutState: FunctionComponent<{currentPath: string}> = ({currentPath}) => <FormattedMessage id='i18n:nav:login:text'>
  {(msg) => <a
    href={'/accounts/login?r=' + currentPath}
    data-testid='nav-login'
    data-analytics-label='login'
    className="navbar-link"
    style={{
      '--nav-text-color': theme.color.primary.gray.base,
      '--nav-text-hover': theme.color.primary.gray.darker,
      '--nav-border-color': theme.color.primary.green.base,
    } as React.CSSProperties}
  >
    {msg}
  </a>}
</FormattedMessage>;

export const ConnectedLoginButton = () => {
  const currentPath = useSelector((state: AppState) => selectNavigation.pathname(state));
  return <LoggedOutState currentPath={currentPath} />;
};

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
    <div
      className="navbar-bar-wrapper"
      data-analytics-region='openstax-navbar'
      style={{
        '--navbar-z-index': theme.zIndex.navbar,
        '--navbar-bg': theme.color.neutral.base,
        '--navbar-padding-desktop': `${theme.padding.page.desktop}rem`,
        '--navbar-padding-mobile': `${theme.padding.page.mobile}rem`,
      } as React.CSSProperties}
    >
      <div
        className="navbar-topbar"
        data-testid='navbar'
        style={{
          '--navbar-height-desktop': '6rem',
          '--navbar-height-mobile': '5.2rem',
          '--navbar-max-width': '128rem',
        } as React.CSSProperties}
      >
        <a
          href={logoUrl}
          onClick={(e) => unsavedHighlightsHandler(e, logoUrl)}
        >
          <img
            role='img'
            src={openstaxLogo}
            alt={intl.formatMessage({id: 'i18n:nav:logo:alt'})}
            className="navbar-header-image"
            style={{
              '--navbar-logo-height-desktop': '3.5rem',
              '--navbar-logo-height-mobile': '2.8rem',
            } as React.CSSProperties}
          />
        </a>
        {loggedOut && <LoggedOutState currentPath={currentPath} />}
        {user && <LoggedInState user={user} currentPath={currentPath} hasUnsavedHighlight={hasUnsavedHighlight} />}
      </div>
    </div>
  );
};

const ConnectedNavigationBar = () => {
  const currentPath = useSelector((state: AppState) => selectNavigation.pathname(state));
  const params = useSelector((state: AppState) => selectNavigation.params(state));
  const loggedOut = useSelector((state: AppState) => authSelect.loggedOut(state));
  const user = useSelector((state: AppState) => authSelect.user(state));
  const hasUnsavedHighlight = useSelector((state: AppState) => selectHighlights.hasUnsavedHighlight(state));

  return (
    <NavigationBar
      currentPath={currentPath}
      params={params}
      loggedOut={loggedOut}
      user={user}
      hasUnsavedHighlight={hasUnsavedHighlight}
    />
  );
};

export default ConnectedNavigationBar;
