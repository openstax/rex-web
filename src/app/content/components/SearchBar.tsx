import React, { Component } from 'react';
import { connect } from 'react-redux';
import withServices from '../../context/Services';
import styled from 'styled-components';
import { AppServices, AppState } from '../../types';
import * as select from '../selectors';
import { Book, Page } from '../types';
import {ListOl} from 'styled-icons/boxicons-regular/ListOl';
import {Search} from 'styled-icons/boxicons-regular/Search';
import {Print} from 'styled-icons/fa-solid/Print';
import { findArchiveTreeSection } from '../utils'

const ListIcon = styled(ListOl)`
  height: 2rem;
  width: 2rem;
  color: #027EB5;
  margin-right: 7px;
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
  margin-right: 7px;
`;

interface PropTypes {
    page?: Page;
    book?: Book;
    services: AppServices;
}

const TopBar = styled.div`
  height: 5rem;
  width: 100%;
  max-width: 1170px;
  font-size: 1.25rem;
  font-weight: bold;
  background: transparent;
  margin: 0 auto;
  text-align: left;
`;

const TableTitle = styled.h3`
  color: #027EB5;
  font-size: 1.6rem;
`;

const InputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  margin-right: 4rem;
`;

const SearchTxt = styled.input`
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
  border-bottom: solid 1px;
  padding-left: 2rem;

  &::placeholder {
    color: 'blue'
  }
`;

const PrintTxt = styled.h3`
  color: #818181;
  font-size: 1.6rem;
`;

const TableTitleWrapper = styled.div`
  text-align: left;
  float: left;
`;

const SearchPrintWrapper = styled.div`
  text-align: right;
  float: right;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const BarWrapper = styled.div` 
  width: 100%;
  text-align: center;
  padding: 0 155px;
  box-shadow: 0px 2px 2px 0px rgba(0,0,0,0.14);
  display: inline-block;
  background: #FFFFFF;
`;

export class SearchComponent extends Component<PropTypes> {
  public render() {
    const {page, book} = this.props as PropTypes;
    
    if (!book || !page) {
      return null
    }

    const treeSection = findArchiveTreeSection(book, page.id);

    if(!treeSection) {
      return null;
    }

    return <BarWrapper>
        <TopBar>
          <TableTitleWrapper>
            <TableTitle><ListIcon/>Table of contents</TableTitle>
          </TableTitleWrapper>  
          <SearchPrintWrapper>
            <InputWrapper>
              <SearchIcon /><SearchTxt placeholder="Search this book"></SearchTxt>
            </InputWrapper>
            <PrintTxt><PrintIcon />Print options</PrintTxt>
          </SearchPrintWrapper>
        </TopBar>
      </BarWrapper>;
  }
}

export default connect(
  (state: AppState) => ({
    book: select.book(state),
    page: select.page(state),
  })
)(withServices(SearchComponent));

