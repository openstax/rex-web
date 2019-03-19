import React, { SFC } from 'react';
import { FormattedMessage } from 'react-intl';
import styled, { css } from 'styled-components';
import openstaxLogo from '../../assets/logo.svg';
import { h4Style } from '../components/Typography';
import theme from '../theme';
import { assertString } from '../utils';

export const maxNavWidth = 117;
export const navDesktopHeight = 5;
export const navMobileHeight = 3.6;

// tslint:disable-next-line:variable-name
const TopBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: ${navDesktopHeight}rem;
  max-width: ${maxNavWidth}rem;
  background: ${theme.color.neutral.base};
  margin: 0 auto;

  ${theme.breakpoints.mobile(css`
    height: ${navMobileHeight}rem;
  `)}
`;

// tslint:disable-next-line:variable-name
const LogoLink = styled.a`
`;

// tslint:disable-next-line:variable-name
const HeaderImage = styled.img`
  width: auto;
  height: 3rem;

  ${theme.breakpoints.mobile(css`
    height: 2rem;
  `)}
`;

// tslint:disable-next-line:variable-name
const LoginTxt = styled.a`
  ${h4Style}
  text-decoration: none;
  font-weight: bold;
  color: ${theme.color.primary.gray.base};
  padding: 1rem 0;

  :hover, :active, :focus {
    padding-bottom: 0.6rem;
    border-bottom: 0.4rem solid ${theme.color.primary.green.base};
  }

  ${theme.breakpoints.mobile(css`
    padding: 0.7rem 0;

    :hover, :active, :focus {
      padding-bottom: 0.3rem;
    }
  `)}
`;

// tslint:disable-next-line:variable-name
const BarWrapper = styled.div`
  z-index: 2; /* drop shadow above notifications */
  position: relative; /* drop shadow above notifications */
  padding: 0 ${theme.padding.page.desktop}rem;
  box-shadow: 0 0.2rem 0.2rem 0 rgba(0, 0, 0, 0.1);

  ${theme.breakpoints.mobile(css`
    padding: 0 ${theme.padding.page.mobile}rem;
  `)}
`;

// tslint:disable-next-line:variable-name
const NavigationBar: SFC = ({}) =>
  <BarWrapper>
    <TopBar>
      <FormattedMessage id='i18n:nav:logo:alt'>
        {(msg: Element | string) => <LogoLink href='/'>
          <HeaderImage src={openstaxLogo} alt={assertString(msg, 'alt text must be a string')} />
        </LogoLink>}
      </FormattedMessage>
      <FormattedMessage id='i18n:nav:login:text'>
        {(msg: Element | string) => <LoginTxt href='https://accounts-dev.openstax.org/login'>{msg}</LoginTxt>}
      </FormattedMessage>
    </TopBar>
  </BarWrapper>;

export default NavigationBar;
