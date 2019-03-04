import React, { SFC } from 'react';
import styled from 'styled-components';
import {ListOl} from 'styled-icons/boxicons-regular/ListOl';
import {Search} from 'styled-icons/boxicons-regular/Search';
import {Print} from 'styled-icons/fa-solid/Print';

const ListIcon = styled(ListOl)`
  height: 2rem;
  width: 2rem;
  color: #027EB5;
  margin-right: 0.7rem;

  :hover {
    color: #0064A0;
  }
`;

const SearchIcon = styled(Search)`
  height: 2rem;
  width: 2rem;
  color: #818181;
  margin-right: 7px;
  position: absolute;
`;

const PrintIcon = styled(Print)`
  height: 2rem;
  width: 2rem;
  color: #818181;
  margin-right: 0.7rem;
`;

const TopBar = styled.div`
  height: 5rem;
  width: 100%;
  max-width: 117rem;
  font-size: 1.25rem;
  font-weight: bold;
  background: transparent;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ToCButton = styled.h3`
  color: #027EB5;
  font-size: 1.6rem;
  cursor: pointer;

  :hover {
    color: #0064A0;
  }

`;

const SearchInputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  margin-right: 4rem;
`;

const SearchInput = styled.input`
  font-size: 16px;
  font-weight: normal;
  font-style: normal;
  font-stretch: normal;
  line-height: 2.5rem;
  letter-spacing: normal;
  color: #818181;
  border-top: none;
  border-left: none;
  border-right: none;
  border-bottom: solid 0.1rem;
  padding-left: 2rem;
  height: 2.5rem;
`;

const PrintTxt = styled.h3`
  color: #818181;
  font-size: 1.6rem;
  cursor: pointer;
`;

const ToCButtonWrapper = styled.div`
  text-align: left;
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
  display: inline-block;
  background: #FFFFFF;
`;

const NavigationBar: SFC = ({children}) => <BarWrapper>
  <TopBar>
    <ToCButtonWrapper>
      <ToCButton><ListIcon/>Table of contents</ToCButton>
    </ToCButtonWrapper>  
    <SearchPrintWrapper>
      <SearchInputWrapper>
        <SearchIcon /><SearchInput placeholder="Search this book"></SearchInput>
      </SearchInputWrapper>
      <PrintTxt><PrintIcon />Print options</PrintTxt>
    </SearchPrintWrapper>
  </TopBar>
  {children}
</BarWrapper>


export default NavigationBar;      