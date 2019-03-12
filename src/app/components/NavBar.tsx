import React, { SFC } from 'react';
import styled from 'styled-components';
import openstaxLogo from '../../assets/logo.svg';
import { h4Style } from '../components/Typography';
import theme from '../theme';

// tslint:disable-next-line:variable-name
const TopBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 5rem;
  max-width: 117rem;
  background: ${theme.color.neutral.base};
  margin: 0 auto;

  @media (max-width: ${theme.mobileBreakpoint.default.width}) {
    height: 3.6rem;
  }
`;

// tslint:disable-next-line:variable-name
const LogoLink = styled.a`
`;

// tslint:disable-next-line:variable-name
const HeaderImage = styled.img`
  width: auto;
  height: 3rem;

  @media (max-width: ${theme.mobileBreakpoint.default.width}) {
    height: 2rem;
  }
`;

// tslint:disable-next-line:variable-name
const LoginTxt = styled.a`
  ${h4Style}
  font-family: Helvetica Neue;
  text-decoration: none;
  font-weight: bold;
  color: #5E6062;
  padding: 1rem 0;
  height: 5rem;
  overflow: visible;

  :hover, :active, :focus {
    border-bottom: 0.4rem solid #63a524;
  }

  @media(max-width: ${theme.mobileBreakpoint.default.width}) {
    height: 3.6rem;
  }
`;

// tslint:disable-next-line:variable-name
const BarWrapper = styled.div`
  padding: ${theme.contentBuffer.default.padding};
  box-shadow: 0 0.2rem 0.2rem 0 rgba(0, 0, 0, 0.1);

  @media (max-width: ${theme.mobileBreakpoint.default.width}) {
    padding: ${theme.contentBuffer.mobile.default.padding};
  }
`;

// tslint:disable-next-line:variable-name
const NavigationBar: SFC = ({}) =>
  <BarWrapper>
    <TopBar>
      <LogoLink href='/'><HeaderImage src = {openstaxLogo} alt='OpenStax Logo'/></LogoLink>
      <LoginTxt href='https://accounts-dev.openstax.org/login'>Login</LoginTxt>
    </TopBar>
  </BarWrapper>;

export default NavigationBar;
