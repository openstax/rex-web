import React, { SFC } from 'react';
import styled from 'styled-components';
import openstaxLogo from '../../assets/logo.svg';

//import theme, { ColorSet } from '../theme';

/*const applyColor = (color: ColorSet) => `
  color: ${color.foreground};
  background-color: ${color.base};

  :hover {
    background-color: ${color.darker};
  }
  :active {
    background-color: ${color.darkest};
  }
`;*/

const TopBar = styled.div`
    /* -webkit-align-items: baseline; */
    /* -webkit-box-align: baseline; */
    -ms-flex-align: baseline;
    /* align-items: baseline; */
    display: -webkit-box;
    display: -webkit-flex;
    display: -ms-flexbox;
    display: flex;
    -webkit-box-pack: justify;
    -webkit-justify-content: space-between;
    -ms-flex-pack: justify;
    justify-content: space-between;
    /* box-sizing: border-box; */
    cursor: pointer;
    display: -webkit-inline-box;
    /* display: -webkit-inline-flex; */
    display: -ms-inline-flexbox;
    /* display: inline-flex; */
    height: 5rem;
    padding: 0 135px;
    -webkit-text-decoration: none;
    text-decoration: none;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
    white-space: nowrap;
    width: 100%;
    max-width: 1170px;
    font-size: 1.25rem;
    font-weight: bold;
    background: #FFFFFF;
    box-shadow: 0px 2px 2px 0px rgba(0, 0, 0, 1);
`;

const HeaderImage = styled.img`
width: auto;
height: 3rem;
margin-top: 1rem;
`;

const LoginTxt = styled.div`
    font-size: 18px;
    font-weight: bold;
    color: #5E6062;
    margin-top: 1rem;
    height: 3rem;
    line-height: 3rem;

    :hover {
        border-bottom: 4px solid #63a524;
    }
    :active {
        border-bottom: 4px solid #63a524;
    }
    :focus {
        border-bottom: 4px solid #63a524;
    }
`;
const NavigationBar: SFC = ({children}) => <TopBar>
  <HeaderImage src = {openstaxLogo}/>
  <LoginTxt>Login</LoginTxt>
  {children}
</TopBar>;

export default NavigationBar;