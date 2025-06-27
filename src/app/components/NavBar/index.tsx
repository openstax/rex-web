import { HTMLElement } from '@openstax/types/lib.dom';
import React, { FunctionComponent } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { connect } from 'react-redux';
import openstaxLogo from '../../../assets/logo.svg';
import * as authSelect from '../../auth/selectors';
import * as selectHighlights from '../../content/highlights/selectors';
import { User } from '../../auth/types';
import * as selectNavigation from '../../navigation/selectors';
import { AppState } from '../../types';
import OnScroll, { OnScrollCallback } from '../OnScroll';
import * as Styled from './styled';
import UserIcon from '../../../assets/UserIcon';
import * as guards from '../../guards';
import showConfirmation from '../../content/highlights/components/utils/showConfirmation';
import { useServices } from '../../context/Services';
import { assertWindow } from '../../utils';

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

// tslint:disable-next-line:variable-name
export const Dropdown: FunctionComponent<{
  user: User,
  currentPath: string,
  logOutHandler: (e: React.MouseEvent, url: string) => void
}> = ({user, currentPath, logOutHandler}) => {

  const overlay = React.useRef<HTMLElement>();
  const logOutUrl = '/accounts/logout?r=' + currentPath;

  const blockScroll: OnScrollCallback = (e) => {
    if (typeof(window) === 'undefined' || !overlay.current) {
      return;
    }

    const style = window.getComputedStyle(overlay.current);
    const visible = style.height !== '0px';

    if (visible) {
      e.preventDefault();
    }
  };

  return (
    <OnScroll callback={blockScroll}>
      <Styled.DropdownOverlay
        tabIndex='-1'
        ref={overlay}
        data-testid='nav-overlay'
      >
        <a aria-hidden='true' tabIndex={-1} href='/'>
          <Styled.OverlayLogo
            src={openstaxLogo}
            alt={useIntl().formatMessage({ id: 'i18n:nav:logo:alt' })}
          />
        </a>
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
                  <a href='/accounts/profile' target='_blank' role='menuitem'>
                    {msg}
                  </a>
                )}
              </FormattedMessage>
            </li>
            <li role='presentation'>
              <FormattedMessage id='i18n:nav:logout:text'>
                {msg => (
                  <a
                    href={logOutUrl}
                    role='menuitem'
                    onClick={e => logOutHandler(e, logOutUrl)}
                  >
                    {msg}
                  </a>
                )}
              </FormattedMessage>
            </li>
          </Styled.DropdownList>
        </div>
      </Styled.DropdownOverlay>
    </OnScroll>
  );
};

// tslint:disable-next-line:variable-name
const DropdownToggle: FunctionComponent<{ user: User }> = ({
  user: { firstName, lastName },
}) => {
  const renderEl = firstName && lastName ? (firstName[0] + lastName[0]).toUpperCase() : <UserIcon />;
  return (
    <Styled.DropdownToggle
      tabIndex='0'
      data-testid='user-nav-toggle'
      aria-label='account actions'
      aria-haspopup='true'
      aria-controls='dropdown-menu'
    >
      {renderEl}
    </Styled.DropdownToggle>
  );
};

// tslint:disable-next-line:variable-name
const LoggedInState: FunctionComponent<{
  user: User;
  currentPath: string;
  logOutHandler: (e: React.MouseEvent, url: string) => void
}> = ({
  user,
  currentPath,
  logOutHandler,
}) => (
  <Styled.DropdownContainer data-testid='user-nav'>
    <DropdownToggle user={user} />
    <Dropdown user={user} currentPath={currentPath} logOutHandler={logOutHandler} />
    <Styled.TimesIcon />
  </Styled.DropdownContainer>
);

// tslint:disable-next-line:variable-name
const LoggedOutState: FunctionComponent<{currentPath: string}> = ({currentPath}) => <FormattedMessage id='i18n:nav:login:text'>
  {(msg) => <Styled.Link href={'/accounts/login?r=' + currentPath}
    data-testid='nav-login' data-analytics-label='login'> {msg}
  </Styled.Link>}
</FormattedMessage>;

interface NavigationBarProps {
  user?: User;
  loggedOut: boolean;
  currentPath: string;
  params: unknown;
  hasUnsavedHighlight: boolean;
}
// tslint:disable-next-line:variable-name
const NavigationBar = ({user, loggedOut, currentPath, hasUnsavedHighlight, params}: NavigationBarProps) => {
  const logoUrl = guards.isPortaled(params) ? `/${params.portalName}/` : '/';
  const unsavedHighlightsHandler = useUnsavedHighlightsValidator(hasUnsavedHighlight);


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
            alt={useIntl().formatMessage({id: 'i18n:nav:logo:alt'})}
          />
        </a>
        {loggedOut && <LoggedOutState currentPath={currentPath} />}
        {user && <LoggedInState user={user} currentPath={currentPath} logOutHandler={unsavedHighlightsHandler} />}
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
