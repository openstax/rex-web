import React, { SFC } from 'react';
import styled, { css } from 'styled-components';
import { Print } from 'styled-icons/fa-solid/Print';
import { Search } from 'styled-icons/fa-solid/Search';
import { textRegularStyle } from '../../components/Typography';
import theme from '../../theme';
import SidebarControl from './SidebarControl';

export const toolbarIconColor = '#5E6062';

export const toolbarIconStyles = css`
  height: 1.6rem;
  width: 1.6rem;
  margin-right: 0.7rem;
  color: ${toolbarIconColor};
`;

// tslint:disable-next-line:variable-name
const SearchIcon = styled(Search)`
  ${toolbarIconStyles};
`;

// tslint:disable-next-line:variable-name
const PrintIcon = styled(Print)`
  ${toolbarIconStyles};
`;

// tslint:disable-next-line:variable-name
const TopBar = styled.div`
  height: 5rem;
  max-width: 117rem;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  overflow: visible;

  ${theme.breakpoints.mobile(css`
    height: 4rem;
  `)}
`;

// tslint:disable-next-line:variable-name
const SearchInputWrapper = styled.div`
  display: flex;
  align-items: center;
  margin-right: 4rem;
  border-bottom: solid 0.1rem ${toolbarIconColor};

  ${theme.breakpoints.mobile(css`
    border: none;
    margin-right: 1rem;
  `)}
`;

// tslint:disable-next-line:variable-name
const SearchInput = styled.input`
  ${textRegularStyle}
  color: ${theme.color.text.default};
  height: 2.5rem;
  border: none;
  outline: none;

  ::placeholder {
    color: ${toolbarIconColor};
  }
  ${theme.breakpoints.mobile(css`
    display: none;
  `)}
`;

// tslint:disable-next-line:variable-name
const PrintOptWrapper = styled.div`
  cursor: pointer;
  display: flex;
  align-items: center;
`;

// tslint:disable-next-line:variable-name
const PrintOptions = styled.h3`
  ${textRegularStyle};
  color: ${toolbarIconColor};
  margin: 0;

  ${theme.breakpoints.mobile(css`
    display: none;
  `)}
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
  padding: 0 ${theme.padding.page.desktop}rem;
  box-shadow: 0 0.2rem 0.2rem 0 rgba(0,0,0,0.14);
  position: relative;  /* to make the drop shadow show over the content */
  display: block;
  background: ${theme.color.neutral.base};

  ${theme.breakpoints.mobile(css`
    padding: 0 ${theme.padding.page.mobile}rem;
  `)}
`;

// tslint:disable-next-line:variable-name
const NavigationBar: SFC = ({children}) => <BarWrapper>
  <TopBar>
    <SidebarControl />
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
