import React, { SFC } from 'react';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import styled, { css } from 'styled-components/macro';
import { Bars as Hamburger } from 'styled-icons/fa-solid/Bars';
import { ChevronDown } from 'styled-icons/fa-solid/ChevronDown';
import openstaxLogo from '../../assets/logo.svg';
import * as authSelect from '../auth/selectors';
import { User } from '../auth/types';
import { disablePrint } from '../content/components/utils/disablePrint';
import * as selectNavigation from '../navigation/selectors';
import theme from '../theme';
import { AppState } from '../types';
import { assertString } from '../utils';
import Times from './Times';
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
const OverlayLogo = styled.img`
  display: none;
  width: auto;
  height: 2rem;
  position: absolute;
  left: 1.6rem;
  top: 1rem;
`;

// tslint:disable-next-line:variable-name
const DownIcon = styled(ChevronDown)`
  margin-left: 1rem;
  height: 1.5rem;
  width: 1.5rem;
  ${theme.breakpoints.mobile(css`
    display: none;
  `)}
`;

// tslint:disable-next-line:variable-name
const HamburgerIcon = styled(Hamburger)`
  margin-top: 0.1rem;
  margin-left: 1rem;
  height: 1.5rem;
  width: 1.5rem;
  display: none;
  ${theme.breakpoints.mobile(css`
    display: inline;
  `)}
`;

const navElementStyle = css`
  display: block;
  font-size: 1.8rem;
  text-decoration: none;
  font-weight: bold;
  padding: 1rem 0;
  color: ${theme.color.primary.gray.base};

  :hover {
    color: ${theme.color.primary.gray.darker};
  }

  ${theme.breakpoints.mobile(css`
    font-size: 1.4rem;
    font-weight: normal;
    padding: 0.7rem 0;
  `)}
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
const DropDownToggle = styled.span`
  ${navElementStyle}
  cursor: pointer;
`;

// tslint:disable-next-line:variable-name
const DropDown = styled.ul`
  box-shadow: 0 0.5rem 0.5rem 0 rgba(0, 0, 0, 0.1);
  overflow: visible;
  margin: 0;
  padding: 0.6rem 0;
  position: absolute;
  background: ${theme.color.neutral.base};
  top: calc(100% - 0.4rem);
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

  ${theme.breakpoints.mobile(css`
    box-shadow: none;
    position: static;
    border: none;
  `)}
`;

const visuallyHidden = css`
  position: absolute;
  height: 1px;
  width: 1px;
  overflow: hidden;
  clip: rect(1px, 1px, 1px, 1px);
`;

// tslint:disable-next-line:variable-name
const TimesIcon = styled((props) => <a href='' tabIndex='-1' aria-hidden='true' {...props}><Times /></a>)`
  position: absolute;
  top: 1rem;
  right: 1.6rem;
  color: ${theme.color.primary.gray.base};
  display: none;
`;

// tslint:disable-next-line:variable-name
const DropdownContainer = styled.div`
  overflow: visible;
  position: relative;

  :not(:hover):not(.ally-focus-within) ${DropDown} {
    ${visuallyHidden}
  }

  :not(:hover):not(:focus-within) ${DropDown} {
    ${visuallyHidden}
  }

  ${theme.breakpoints.mobile(css`
    :not(:focus) ${DropDown} {
      ${visuallyHidden}
    }

    &:focus {
      background: ${theme.color.neutral.base};
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      position: fixed;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding-top: 40%;

      ${DropDownToggle} {
        font-size: 1.8rem;
        font-weight: 700;
      }
      ${HamburgerIcon} {
        display: none;
      }
      ${TimesIcon}, ${OverlayLogo} {
        display: block;
      }
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
      {user && <DropdownContainer tabIndex='0'>
        <FormattedMessage id='i18n:nav:logo:alt'>
          {(msg: Element | string) =>
            <OverlayLogo role='img' src={openstaxLogo} alt={assertString(msg, 'alt text must be a string')} />}
        </FormattedMessage>
        <div>
          <FormattedMessage id='i18n:nav:hello:text' values={{name: user.firstName}}>
            {(msg: Element | string) => <DropDownToggle>
              {msg}
              <DownIcon />
              <HamburgerIcon />
              <TimesIcon />
            </DropDownToggle>}
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
        </div>
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
