import { SearchResultHit } from '@openstax/open-search-client';
import flow from 'lodash/fp/flow';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { AppState, Dispatch } from '../../../../types';
import * as select from '../../../selectors';
import { Book } from '../../../types';
import { clearSearch, requestSearch } from '../../actions';
import * as selectSearch from '../../selectors';
import { SearchResultContainer, SelectedResult } from '../../types';
import { SearchResultsBarWrapper } from './SearchResultsBarWrapper';
import { SearchResultsStatus } from './SearchResultStatus';

interface Props {
  book?: Book;
  query: string | null;
  hasQuery: boolean;
  keyTermHits: SearchResultHit[] | null;
  mobileToolbarOpen: boolean;
  nonKeyTermResults: SearchResultContainer[] | null;
  totalHits: number | null;
  totalHitsKeyTerms: number | null;
  results: SearchResultContainer[] | null;
  onClose: () => void;
  clearSearch: () => void;
  search: typeof requestSearch;
  searchButtonColor: string | null;
  searchInSidebar: boolean;
  searchResultsOpen: boolean;
  selectedResult: SelectedResult | null;
  userSelectedResult: boolean;
}

interface State {
  results: SearchResultContainer[] | null;
  query: string | null;
  totalHits: number | null;
  totalHitsKeyTerms: number | null;
  selectedResult: SelectedResult | null;
}

export class SearchResultsSidebar extends Component<Props, State> {

  public static getDerivedStateFromProps(newProps: Props, state: State) {
    if (newProps.results || (newProps.query !== state.query && newProps.query)) {
      return SearchResultsSidebar.getStateProps(newProps);
    }
    return state;
  }

  private static getStateProps(props: Props) {
    return {
      nonKeyTermResults: props.nonKeyTermResults,
      query: props.query,
      results: props.results,
      selectedResult: props.selectedResult,
      totalHits: props.totalHits,
      totalHitsKeyTerms: props.totalHitsKeyTerms,
    };
  }
  public state: State = {
    query: null,
    results: null,
    selectedResult: null,
    totalHits: null,
    totalHitsKeyTerms: null,
  };

  public constructor(props: Props) {
    super(props);

    this.state = SearchResultsSidebar.getStateProps(props);
  }

  public render() {
    return (
      <>
        <SearchResultsStatus
          query={this.state.query}
          results={this.state.results}
          totalHits={this.props.totalHits}
          totalHitsKeyTerms={this.props.totalHitsKeyTerms}
        />
        {this.props.searchResultsOpen || this.state.query
          ? <SearchResultsBarWrapper
            {...this.props}
            {...this.state}
            data-analytics-region='search-results'
          />
          : null}
      </>
    );
  }
}

export default connect(
  (state: AppState) => ({
    book: select.book(state),
    hasQuery: !!selectSearch.query(state),
    keyTermHits: selectSearch.keyTermHitsInTitle(state),
    mobileToolbarOpen: selectSearch.mobileToolbarOpen(state),
    nonKeyTermResults: selectSearch.nonKeyTermResults(state),
    query: selectSearch.query(state),
    results: selectSearch.results(state),
    searchButtonColor: selectSearch.searchButtonColor(state),
    searchInSidebar: selectSearch.searchInSidebar(state),
    searchResultsOpen: selectSearch.searchResultsOpen(state),
    selectedResult: selectSearch.selectedResult(state),
    totalHits: selectSearch.totalHits(state),
    totalHitsKeyTerms: selectSearch.totalHitsKeyTerms(state),
    userSelectedResult: selectSearch.userSelectedResult(state),
  }),
  (dispatch: Dispatch) => ({
    clearSearch: flow(clearSearch, dispatch),
    onClose: () => {
      dispatch(clearSearch());
    },
    search: flow(requestSearch, dispatch),
  })
)(SearchResultsSidebar);
