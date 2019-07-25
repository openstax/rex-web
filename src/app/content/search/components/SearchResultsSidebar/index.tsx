import React, { Component } from 'react';
import { connect } from 'react-redux';
import { AppState, Dispatch } from '../../../../types';
import * as select from '../../../selectors';
import { Book } from '../../../types';
import { clearSearch, closeSearchResults } from '../../actions';
import * as selectSearch from '../../selectors';
import { SearchResultContainer } from '../../types';
import { SearchResultsBarWrapper } from './SearchResultsBarWrapper';

interface SearchResultsSidebarProps {
  book?: Book;
  query: string | null;
  totalHits: number | null;
  results: SearchResultContainer[] | null;
  onClose: () => void;
  mobileOpen: boolean;
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
    mobileOpen: selectSearch.mobileOpen(state),
    query: selectSearch.query(state),
    results: selectSearch.results(state),
    totalHits: selectSearch.totalHits(state),
  }),
  (dispatch: Dispatch) => ({
    closeSearchResults: () => {
      dispatch(closeSearchResults());
    },
    onClose: () => {
      dispatch(clearSearch());
    },
  })
)(SearchResultsSidebar);
