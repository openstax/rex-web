import React, { SFC } from 'react';
import styled from 'styled-components';
import {ListOl} from 'styled-icons/fa-solid/ListOl';
import {Search} from 'styled-icons/fa-solid/Search';
import {Print} from 'styled-icons/fa-solid/Print';
import theme from '../../theme';
import {bodyCopyRegularStyle} from '../../components/Typography';

const iconStyles = {
  mobile: {
    height: '1.6rem',
    width: '1.6rem',
  },
}

const ListIcon = styled(ListOl)`
  height: ${iconStyles.mobile.height};
  width: ${iconStyles.mobile.width};
  color: ${theme.color.secondary.darkBlue.base};
  margin-right: 0.7rem;

  :hover {
    color: ${theme.color.secondary.darkBlue.foreground};
  }

`;

const SearchIcon = styled(Search)`
  height: ${iconStyles.mobile.height};
  width: ${iconStyles.mobile.width};
  color: ${theme.color.secondary.darkGray.base};
  margin-right: 0.7rem;
`;

const PrintIcon = styled(Print)`
  height: ${iconStyles.mobile.height};
  width: ${iconStyles.mobile.width};
  color: ${theme.color.secondary.darkGray.base};
  margin-right: 0.7rem;

`;

const TopBar = styled.div`
  height: 5rem;
  max-width: 117rem;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;

  @media (max-width: ${theme.mobileBreakpoint.default.width}) {
    height: 4rem;
  }
  
`;

const ToCButton = styled.h3`
  ${bodyCopyRegularStyle};
  color: ${theme.color.secondary.darkBlue.base};
  cursor: pointer;
  margin: 0;

  :hover {
    color: ${theme.color.secondary.darkBlue.foreground};
  }

`;

const SearchInputWrapper = styled.div`
  display: flex;
  align-items: center;
  margin-right: 4rem;
  border-bottom: solid 0.1rem ${theme.textColors.default};

  @media (max-width: ${theme.mobileBreakpoint.default.width}) {
    border: none;
    margin-right: 1rem;
  }
`;

const SearchInput = styled.input`
  ${bodyCopyRegularStyle};
  color: ${theme.textColors.default};
  height: 2.5rem;
  border: none;
  outline: none;

  ::placeholder {
    color: ${theme.color.secondary.darkGray.base};
  }
  
  @media (max-width: ${theme.mobileBreakpoint.default.width}) {
    display: none;
  }
`;

const PrintOptWrapper = styled.div`
  cursor: pointer;
  display: flex;
  align-items: center;
`;

const PrintOptions = styled.h3`
  ${bodyCopyRegularStyle};
  color: ${theme.color.secondary.darkGray.base};
  margin: 0;

  @media (max-width: ${theme.mobileBreakpoint.default.width}) {
    display: none;
  }
`;

const ToCButtonWrapper = styled.div`
  display: flex;
  align-items: center;
`;

const SearchPrintWrapper = styled.div`
  text-align: right;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const BarWrapper = styled.div` 
  width: 100%;
  padding: 0 15.5rem;
  box-shadow: 0 0.2rem 0.2rem 0 rgba(0,0,0,0.14);
  display: block;
  background: ${theme.color.neutral.base};

  @media (max-width: ${theme.mobileBreakpoint.default.width}) {
    padding: ${theme.contentBuffer.mobile.default.padding};
  }
`;

const NavigationBar: SFC = ({children}) => <BarWrapper>
  <TopBar>
    <ToCButtonWrapper>
      <ListIcon/><ToCButton>Table of contents</ToCButton>
    </ToCButtonWrapper>  
    <SearchPrintWrapper>
      <SearchInputWrapper>
        <SearchIcon /><SearchInput placeholder="Search this book"></SearchInput>
      </SearchInputWrapper>
      <PrintOptWrapper><PrintIcon /><PrintOptions>Print options</PrintOptions></PrintOptWrapper>
    </SearchPrintWrapper>
  </TopBar>
  {children}
</BarWrapper>


export default NavigationBar;      