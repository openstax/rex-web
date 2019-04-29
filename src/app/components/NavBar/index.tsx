import React, { SFC } from 'react';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import openstaxLogo from '../../../assets/logo.svg';
import * as authSelect from '../../auth/selectors';
import { User } from '../../auth/types';
import * as selectNavigation from '../../navigation/selectors';
import { AppState } from '../../types';
import { assertString } from '../../utils';
import * as Styled from './styled';

export {maxNavWidth, navDesktopHeight, navMobileHeight} from './styled';

if (typeof(window) !== 'undefined') {
  import('ally.js/style/focus-within').then((module) => module.default());
}

// tslint:disable-next-line:variable-name
const DropdownToggle: SFC<{user: User}> = ({user}) =>
  <FormattedMessage id='i18n:nav:hello:text' values={{name: user.firstName}}>
    {(msg: Element | string) => <Styled.DropdownToggle tabIndex='0'>
      {msg}
      <Styled.DownIcon aria-hidden='true' />
      <Styled.HamburgerIcon ariaHidden='true' />
    </Styled.DropdownToggle>}
  </FormattedMessage>;

// tslint:disable-next-line:variable-name
const Dropdown: SFC<{user: User}> = ({user}) => <Styled.DropdownOverlay tabIndex='-1'>
  <Styled.OverlayLogo aria-hidden='true' src={openstaxLogo} />
  <div>
    <FormattedMessage id='i18n:nav:hello:text' values={{name: user.firstName}}>
      {(msg: Element | string) => <Styled.OverlayHeading>{msg}</Styled.OverlayHeading>}
    </FormattedMessage>
    <Styled.DropdownList>
      <li>
        <FormattedMessage id='i18n:nav:profile:text'>
          {(msg: Element | string) => <a href='/accounts/profile'>{msg}</a>}
        </FormattedMessage>
      </li>
      <li>
        <FormattedMessage id='i18n:nav:logout:text'>
          {(msg: Element | string) => <a href='/accounts/logout'>{msg}</a>}
        </FormattedMessage>
      </li>
    </Styled.DropdownList>
  </div>
</Styled.DropdownOverlay>;

// tslint:disable-next-line:variable-name
const LoggedInState: SFC<{user: User}> = ({user}) => <Styled.DropdownContainer>
  <DropdownToggle user={user} />
  <Dropdown user={user} />
  <Styled.TimesIcon />
</Styled.DropdownContainer>;

// tslint:disable-next-line:variable-name
const LoggedOutState: SFC<{currentPath: string}> = ({currentPath}) => <FormattedMessage id='i18n:nav:login:text'>
  {(msg: Element | string) => <Styled.Link href={'/accounts/login?r=' + encodeURIComponent(currentPath)}>
    {msg}
  </Styled.Link>}
</FormattedMessage>;

// tslint:disable-next-line:variable-name
const NavigationBar: SFC<{user?: User, loggedOut: boolean, currentPath: string}> = ({user, loggedOut, currentPath}) =>
  <Styled.BarWrapper>
    <Styled.TopBar>
      <FormattedMessage id='i18n:nav:logo:alt'>
        {(msg: Element | string) => <a href='/'>
          <Styled.HeaderImage role='img' src={openstaxLogo} alt={assertString(msg, 'alt text must be a string')} />
        </a>}
      </FormattedMessage>
      {loggedOut && <LoggedOutState currentPath={currentPath} />}
      {user && <LoggedInState user={user} />}
    </Styled.TopBar>
  </Styled.BarWrapper>;

export default connect(
  (state: AppState) => ({
    currentPath: selectNavigation.pathname(state),
    loggedOut: authSelect.loggedOut(state),
    user: authSelect.user(state),
  })
)(NavigationBar);
