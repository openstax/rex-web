
import React, { SFC } from 'react';
import styled, { css } from 'styled-components';
import { ListOl } from 'styled-icons/fa-solid/ListOl';
import { Print } from 'styled-icons/fa-solid/Print';
import { Search } from 'styled-icons/fa-solid/Search';
import { bodyCopyRegularStyle, linkStyle } from '../../components/Typography';
import theme from '../../theme';

export const iconStyles = css`
  height: 1.6rem;
  width: 1.6rem;
  margin-right: 0.7rem;
`;

// tslint:disable-next-line:variable-name
const SearchIcon = styled(Search)`
  ${iconStyles};
  color: ${theme.iconColor};
`;

// tslint:disable-next-line:variable-name
const PrintIcon = styled(Print)`
  ${iconStyles};
  color: ${theme.iconColor};
`;

// tslint:disable-next-line:variable-name
const ListIcon = styled(ListOl)`
  ${iconStyles};
`;

// tslint:disable-next-line:variable-name
const ToCButton = styled.h3`
  ${bodyCopyRegularStyle};
  cursor: pointer;
  margin: 0;
`;

// tslint:disable-next-line:variable-name
const ToCButtonWrapper = styled.div`
  ${linkStyle};
  display: flex;
  align-items: center;
`;

// tslint:disable-next-line:variable-name
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

// tslint:disable-next-line:variable-name
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

// tslint:disable-next-line:variable-name
const SearchInput = styled.input`
  ${bodyCopyRegularStyle};
  color: ${theme.textColors.default};
  height: 2.5rem;
  border: none;
  outline: none;

  ::placeholder {
    color: ${theme.iconColor};
  }
  @media (max-width: ${theme.mobileBreakpoint.default.width}) {
    display: none;
  }
`;

// tslint:disable-next-line:variable-name
const PrintOptWrapper = styled.div`
  cursor: pointer;
  display: flex;
  align-items: center;
`;

// tslint:disable-next-line:variable-name
const PrintOptions = styled.h3`
  ${bodyCopyRegularStyle};
  color: ${theme.iconColor};
  margin: 0;

  @media (max-width: ${theme.mobileBreakpoint.default.width}) {
    display: none;
  }
`;

// tslint:disable-next-line:variable-name
const SearchPrintWrapper = styled.div`
  text-align: right;
  display: flex;
  justify-content: center;
  align-items: center;
`;

// tslint:disable-next-line:variable-name
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

// tslint:disable-next-line:variable-name
const NavigationBar: SFC = ({children}) => <BarWrapper>
  <TopBar>
    <ToCButtonWrapper>
      <ListIcon/><ToCButton>Table of contents</ToCButton>
    </ToCButtonWrapper>
    <SearchPrintWrapper>
      <SearchInputWrapper>
        <SearchIcon /><SearchInput placeholder='Search this book'></SearchInput>
      </SearchInputWrapper>
      <PrintOptWrapper><PrintIcon /><PrintOptions>Print options</PrintOptions></PrintOptWrapper>
    </SearchPrintWrapper>
  </TopBar>
  {children}
</BarWrapper>;

export default NavigationBar;
