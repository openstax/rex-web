import React, { Component } from 'react';
import { connect } from 'react-redux';
import { AppState, Dispatch } from '../../../../types';
import * as select from '../../../selectors';
import { Book, Page } from '../../../types';
import { clearSearch, closeSearchResultsMobile } from '../../actions';
import * as selectSearch from '../../selectors';
import { SearchResultContainer } from '../../types';
import { SearchResultsBarWrapper } from './SearchResultsBarWrapper';

interface SearchResultsSidebarProps {
  currentPage: Page | undefined;
  book?: Book;
  query: string | null;
  totalHits: number | null;
  results: SearchResultContainer[] | null;
  onClose: () => void;
  searchResultsOpen: boolean;
  closeSearchResults: () => void;
}

export class SearchResultsSidebar extends Component<SearchResultsSidebarProps> {
  public render() {
    const {query} = this.props;

    return query && <SearchResultsBarWrapper {...this.props} />;
  }
}

export default connect(
  (state: AppState) => ({
    book: select.book(state),
    currentPage: select.page(state),
    query: selectSearch.query(state),
    results: selectSearch.results(state),
    searchResultsOpen: selectSearch.searchResultsOpen(state),
    totalHits: selectSearch.totalHits(state),
  }),
  (dispatch: Dispatch) => ({
    closeSearchResults: () => {
      dispatch(closeSearchResultsMobile());
    },
    onClose: () => {
      dispatch(clearSearch());
    },
  })
)(SearchResultsSidebar);
