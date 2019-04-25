import React, { SFC } from 'react';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import styled, { css } from 'styled-components/macro';
import { ChevronDown } from 'styled-icons/fa-solid/ChevronDown';
import openstaxLogo from '../../assets/logo.svg';
import * as authSelect from '../auth/selectors';
import { User } from '../auth/types';
import { h4Style } from '../components/Typography';
import { disablePrint } from '../content/components/utils/disablePrint';
import * as selectNavigation from '../navigation/selectors';
import theme from '../theme';
import { AppState } from '../types';
import { assertString } from '../utils';
import { linkHover, textRegularStyle } from './Typography';

if (typeof(window) !== 'undefined') {
  import('ally.js/style/focus-within').then((module) => module.default());
}

export const maxNavWidth = 117;
export const navDesktopHeight = 5;
export const navMobileHeight = 3.6;

// tslint:disable-next-line:variable-name
const TopBar = styled.div`
  overflow: visible;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: ${navDesktopHeight}rem;
  max-width: ${maxNavWidth}rem;
  margin: 0 auto;
  ${theme.breakpoints.mobile(css`
    height: ${navMobileHeight}rem;
  `)}
  ${disablePrint}
`;

// tslint:disable-next-line:variable-name
const HeaderImage = styled.img`
  display: block;
  width: auto;
  height: 3rem;
  ${theme.breakpoints.mobile(css`
    height: 2rem;
  `)}
`;

// tslint:disable-next-line:variable-name
const DownIcon = styled(ChevronDown)`
  margin-left: 1rem;
  height: 1.5rem;
  width: 1.5rem;
`;

// tslint:disable-next-line:variable-name
const DropDown = styled.ul`
  box-shadow: 0 0.5rem 0.5rem 0 rgba(0, 0, 0, 0.1);
  overflow: visible;
  margin: 0;
  padding: 0.6rem 0;
  position: absolute;
  background: ${theme.color.neutral.base};
  top: calc(100% - 0.4rem - 0.4rem);
  right: 0;
  border-top: 0.4rem solid ${theme.color.primary.green.base};

  > li {
    overflow: visible;
    display: block;

    a {
      overflow: visible;
      white-space: nowrap;
      display: block;
      padding: 0 1rem;
      ${textRegularStyle}
      cursor: pointer;
      text-decoration: none;

      :hover {
        color: ${linkHover};
      }
    }
  }
`;

const visuallyHidden = css`
  position: absolute;
  height: 1px;
  width: 1px;
  overflow: hidden;
  clip: rect(1px, 1px, 1px, 1px);
`;

// tslint:disable-next-line:variable-name
const DropdownContainer = styled.div`
  overflow: visible;
  align-self: stretch;
  position: relative;

  :not(:hover):not(.ally-focus-within) ${DropDown} {
    ${visuallyHidden}
  }

  :not(:hover):not(:focus-within) ${DropDown} {
    ${visuallyHidden}
  }
`;

const navElementStyle = css`
  display: block;
  ${h4Style}
  text-decoration: none;
  font-weight: bold;
  color: ${theme.color.primary.gray.base};

  :hover {
    color: ${theme.color.primary.gray.darker};
  }

  padding: 1rem 0;
  ${theme.breakpoints.mobile(css`
    font-size: 1.4rem;
    font-weight: normal;
    padding: 0.7rem 0;
  `)}
`;

// tslint:disable-next-line:variable-name
const DropDownToggle = styled.span`
  ${navElementStyle}
  cursor: pointer;
`;

// tslint:disable-next-line:variable-name
const Link = styled.a`
  :hover,
  :active,
  :focus {
    padding-bottom: 0.6rem;
    border-bottom: 0.4rem solid ${theme.color.primary.green.base};
  }

  ${navElementStyle}
  ${theme.breakpoints.mobile(css`
    :hover,
    :active,
    :focus {
      padding-bottom: 0.3rem;
    }
  `)}
`;

// tslint:disable-next-line:variable-name
const BarWrapper = styled.div`
  overflow: visible;
  z-index: 5; /* above book nav */
  background: ${theme.color.neutral.base};
  position: relative; /* drop shadow above notifications */
  padding: 0 ${theme.padding.page.desktop}rem;
  box-shadow: 0 0.2rem 0.2rem 0 rgba(0, 0, 0, 0.1);
  ${theme.breakpoints.mobile(css`
    padding: 0 ${theme.padding.page.mobile}rem;
  `)}
`;

// tslint:disable-next-line:variable-name
const NavigationBar: SFC<{user?: User, loggedOut: boolean, currentPath: string}> = ({user, loggedOut, currentPath}) =>
  <BarWrapper>
    <TopBar>
      <FormattedMessage id='i18n:nav:logo:alt'>
        {(msg: Element | string) => <a href='/'>
          <HeaderImage role='img' src={openstaxLogo} alt={assertString(msg, 'alt text must be a string')} />
        </a>}
      </FormattedMessage>
      {loggedOut && <FormattedMessage id='i18n:nav:login:text'>
        {(msg: Element | string) => <Link href={'/accounts/login?r=' + encodeURIComponent(currentPath)}>
          {msg}
        </Link>}
      </FormattedMessage>}
      {user && <DropdownContainer>
        <FormattedMessage id='i18n:nav:hello:text' values={{name: user.firstName}}>
          {(msg: Element | string) => <DropDownToggle>{msg}<DownIcon /></DropDownToggle>}
        </FormattedMessage>
        <DropDown>
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
        </DropDown>
      </DropdownContainer>}
    </TopBar>
  </BarWrapper>;

export default connect(
  (state: AppState) => ({
    currentPath: selectNavigation.pathname(state),
    loggedOut: authSelect.loggedOut(state),
    user: authSelect.user(state),
  })
)(NavigationBar);
