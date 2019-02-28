import React, { SFC } from 'react';
import styled from 'styled-components';
import openstaxLogo from '../../assets/logo.svg';

const TopBar = styled.div`
    display: flex;
    justify-content: space-between;
    cursor: pointer;
    height: 5rem;
    width: 100%;
    max-width: 1170px;
    font-size: 1.25rem;
    font-weight: bold;
    background: #FFFFFF;
    margin: 0 auto;
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

const BarWrapper = styled.div`
    width: 100%;
    text-align: center;
    padding: 0 135px;
    box-shadow: 0px 2px 2px 0px rgba(0, 0, 0, 0.1);
    display: inline-block;
`;

const NavigationBar: SFC = ({children}) => 
    <BarWrapper>
        <TopBar>
            <HeaderImage src = {openstaxLogo}/>
            <LoginTxt>Login</LoginTxt>
            {children}
        </TopBar>
    </BarWrapper>;

export default NavigationBar;