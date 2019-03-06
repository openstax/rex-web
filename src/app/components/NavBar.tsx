import React, { SFC } from 'react';
import styled from 'styled-components';
import openstaxLogo from '../../assets/logo.svg';
import theme from '../theme';
import typography from '../components/Typography';

const TopBar = styled.div`
  display: flex;
  justify-content: space-between;
  height: 5rem;
  width: 100%;
  max-width: 117rem;
  font-size: 1.25rem;
  font-weight: bold;
  background: ${theme.color.neutral.base};
  margin: 0 auto;

  @media (max-width: 700px) {
    height: 3.6rem;
  }
`;

const LogoLink = styled.a`
`;

const HeaderImage = styled.img`
  width: auto;
  height: 3rem;
  margin-top: 1rem;

  @media (max-width: 700px) {
    height: 2rem;
    margin-top: 0.8rem;
  }
`;

const LoginTxt = styled.a`
  ${typography.h4Style}
  font-family: Helvetica Neue;
  text-decoration: none;
  font-weight: bold;
  color: #5E6062;
  padding: 1rem 0;
  overflow: visible;

  :hover {
    border-bottom: 0.4rem solid #63a524;
  }
  :active {
    border-bottom: 0.4rem solid #63a524;
  }
  :focus {
    border-bottom: 0.4rem solid #63a524;
  }

  @media(max-width: 700px) {
    font-size: 1.6rem;
    line-height: 1.6rem;
  }
`;

const BarWrapper = styled.div`
  padding: ${theme.contentBuffer.default.padding};
  box-shadow: 0 0.2rem 0.2rem 0 rgba(0, 0, 0, 0.1);

  @media (max-width: 700px) {
    padding: ${theme.contentBuffer.mobile.default.padding};
  }
`;

const NavigationBar: SFC = ({}) => 
  <BarWrapper>
    <TopBar>
      <LogoLink href="/"><HeaderImage src = {openstaxLogo}/></LogoLink>
      <LoginTxt href="https://accounts-dev.openstax.org/login">Login</LoginTxt>
    </TopBar>
  </BarWrapper>;

export default NavigationBar;