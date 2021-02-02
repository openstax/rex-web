import { HTMLElement } from '@openstax/types/lib.dom';
import React, { SFC } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { connect } from 'react-redux';
import openstaxLogo from '../../../assets/logo.svg';
import * as authSelect from '../../auth/selectors';
import { User } from '../../auth/types';
import * as selectNavigation from '../../navigation/selectors';
import { AppState } from '../../types';
import OnScroll, { OnScrollCallback } from '../OnScroll';
import * as Styled from './styled';

export { maxNavWidth, navDesktopHeight, navMobileHeight } from './styled';

if (typeof(window) !== 'undefined') {
  import(/* webpackChunkName: "focus-within-polyfill" */ 'focus-within-polyfill');
}

// tslint:disable-next-line:variable-name
export const Dropdown: React.FunctionComponent<{user: User, currentPath: string}> = ({user, currentPath}) => {
  const overlay = React.useRef<HTMLElement>();

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

  return <OnScroll callback={blockScroll}>
    <Styled.DropdownOverlay tabIndex='-1' ref={overlay} data-testid='nav-overlay'>
      <a aria-hidden='true' tabIndex={-1} href='/'>
        <Styled.OverlayLogo
          src={openstaxLogo}
          alt={useIntl().formatMessage({id: 'i18n:nav:logo:alt'})}
        />
      </a>
      <div>
        <FormattedMessage id='i18n:nav:hello:text' values={{name: user.firstName}}>
          {(msg) => <Styled.OverlayHeading>{msg}</Styled.OverlayHeading>}
        </FormattedMessage>
        <Styled.DropdownList>
          <li>
            <FormattedMessage id='i18n:nav:profile:text'>
              {(msg) => <a href='/accounts/profile' target='_blank'>{msg}</a>}
            </FormattedMessage>
          </li>
          <li>
            <FormattedMessage id='i18n:nav:logout:text'>
              {(msg) => <a href={'/accounts/logout?r=' + currentPath}>{msg}</a>}
            </FormattedMessage>
          </li>
        </Styled.DropdownList>
      </div>
    </Styled.DropdownOverlay>
  </OnScroll>;
};

// tslint:disable-next-line:variable-name
const DropdownToggle: SFC<{user: User}> = ({user}) =>
  <FormattedMessage id='i18n:nav:hello:text' values={{name: user.firstName}}>
    {(msg) => <Styled.DropdownToggle tabIndex='0' data-testid='user-nav-toggle'>
      {msg}
      <Styled.DownIcon aria-hidden='true' />
      <Styled.HamburgerIcon ariaHidden='true' />
    </Styled.DropdownToggle>}
  </FormattedMessage>;

// tslint:disable-next-line:variable-name
const LoggedInState: SFC<{user: User, currentPath: string}> = ({user, currentPath}) =>
  <Styled.DropdownContainer data-testid='user-nav'>
    <DropdownToggle user={user} />
    <Dropdown user={user} currentPath={currentPath} />
    <Styled.TimesIcon />
  </Styled.DropdownContainer>;

// tslint:disable-next-line:variable-name
const LoggedOutState: SFC<{currentPath: string}> = ({currentPath}) => <FormattedMessage id='i18n:nav:login:text'>
  {(msg) => <Styled.Link href={'/accounts/login?r=' + currentPath}
    data-testid='nav-login' data-analytics-label='login'> {msg}
  </Styled.Link>}
</FormattedMessage>;

interface NavigationBarProps {
  user?: User;
  loggedOut: boolean;
  currentPath: string;
}
// tslint:disable-next-line:variable-name
const NavigationBar = ({user, loggedOut, currentPath}: NavigationBarProps) =>
  <Styled.BarWrapper data-analytics-region='openstax-navbar'>
    <Styled.TopBar data-testid='navbar'>
      <a href='/'>
        <Styled.HeaderImage
          role='img'
          src={openstaxLogo}
          alt={useIntl().formatMessage({id: 'i18n:nav:logo:alt'})}
        />
      </a>
      {loggedOut && <LoggedOutState currentPath={currentPath} />}
      {user && <LoggedInState user={user} currentPath={currentPath} />}
    </Styled.TopBar>
  </Styled.BarWrapper>;

export default connect(
  (state: AppState) => ({
    currentPath: selectNavigation.pathname(state),
    loggedOut: authSelect.loggedOut(state),
    user: authSelect.user(state),
  })
)(NavigationBar);
