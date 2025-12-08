import { SearchResultHit } from '@openstax/open-search-client';
import { HTMLElement, HTMLDivElement } from '@openstax/types/lib.dom';
import React, { Component } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import searchIcon from '../.../../../../../../assets/search-icon-v2.svg';
import Loader from '../../../../components/Loader';
import { assertDefined, assertNotNull } from '../../../../utils/assertions';
import { Book } from '../../../types';
import {
    fixSafariScrolling,
    scrollSidebarSectionIntoView,
    setSidebarHeight
} from '../../../utils/domUtils';
import { requestSearch } from '../../actions';
import { SearchResultContainer, SelectedResult } from '../../types';
import RelatedKeyTerms from './RelatedKeyTerms';
import SearchResultContainers from './SearchResultContainers';
import { SidebarSearchInput } from './SidebarSearchInput';
import * as Styled from './styled';

export interface ResultsSidebarProps {
  query: string | null;
  hasQuery: boolean;
  keyTermHits: SearchResultHit[] | null;
  mobileToolbarOpen: boolean;
  nonKeyTermResults: SearchResultContainer[] | null;
  results: SearchResultContainer[] | null;
  onClose: () => void;
  clearSearch: () => void;
  search: typeof requestSearch;
  searchInSidebar: boolean;
  searchResultsOpen: boolean;
  searchButtonColor: string | null;
  book?: Book;
  totalHits: number | null;
  totalHitsKeyTerms: number | null;
  selectedResult: SelectedResult | null;
  userSelectedResult: boolean;
}

// tslint:disable-next-line: variable-name
const LoadingState = ({onClose}: {onClose: () => void}) => <Styled.LoadingWrapper
aria-label={useIntl().formatMessage({id: 'i18n:search-results:bar:loading-state'})}
>
  <Styled.CloseIconWrapper>
    <Styled.CloseIconButton onClick={onClose}>
      <Styled.CloseIcon />
    </Styled.CloseIconButton>
  </Styled.CloseIconWrapper>
  <Loader />
</Styled.LoadingWrapper>;

// tslint:disable-next-line: variable-name
const SearchResultsBar = React.forwardRef<
  HTMLElement, {
    mobileToolbarOpen: boolean,
    searchResultsOpen: boolean,
    hasQuery: boolean,
    children: React.ReactNode,
  }
>(
  (props, ref) => {
    const forwardFocus = React.useCallback(
      ({target, currentTarget}: FocusEvent) => {
        if (target !== currentTarget) {
          return;
        }
        const currentResult = (ref as React.MutableRefObject<HTMLDivElement>)
          .current.querySelector<HTMLElement>('[aria-current="true"]');

        currentResult?.focus();
      },
      [ref]
    );

    return (
      <Styled.SearchResultsBar
        id='search-results-sidebar'
        aria-label={useIntl().formatMessage({id: 'i18n:search-results:bar'})}
        data-testid='search-results-sidebar'
        ref={ref}
        tabIndex={-1}
        onFocus={forwardFocus}
        {...props}
      />
    );
  }
);

export class SearchResultsBarWrapper extends Component<ResultsSidebarProps> {

  public searchSidebar = React.createRef<HTMLElement>();
  public activeSection = React.createRef<HTMLElement>();
  public searchSidebarHeader = React.createRef<HTMLElement>();

  public headerTitle = `i18n:search-results:bar:header:title:${this.props.searchInSidebar ? 'plain' : 'results'}`;

  public blankState = () => <Styled.BlankStateWrapper>
    <Styled.SearchResultsTopBar ref={this.searchSidebarHeader}>
      <Styled.SearchResultsHeader>
        <Styled.SearchResultsHeaderTitle id='search-results-title'>
          <FormattedMessage id='i18n:search-results:bar:header:title:plain'>
            {(msg) => msg}
          </FormattedMessage>
        </Styled.SearchResultsHeaderTitle>
        <Styled.CloseIconButton
          onClick={this.props.onClose}
          data-testid='close-search'
          aria-label='close search'
        >
          <Styled.CloseIcon />
        </Styled.CloseIconButton>
      </Styled.SearchResultsHeader>
      <Styled.SearchQueryWrapper >
        <SidebarSearchInput {...this.props} />
      </Styled.SearchQueryWrapper>
    </Styled.SearchResultsTopBar>

    <Styled.BlankStateMessage>
      <FormattedMessage id='i18n:search-results:bar:blank-state' />
    </Styled.BlankStateMessage>
  </Styled.BlankStateWrapper>;

  public totalResults = () => <Styled.SearchResultsTopBar ref={this.searchSidebarHeader}>
    <Styled.SearchResultsHeader>
      <Styled.SearchResultsHeaderTitle id='search-results-title'>
        <FormattedMessage id={this.headerTitle}>
          {(msg) => msg}
        </FormattedMessage>
      </Styled.SearchResultsHeaderTitle>
      <Styled.CloseIconButton
        onClick={this.props.onClose}
        data-testid='close-search'
        aria-label='close search'
      >
        <Styled.CloseIcon />
      </Styled.CloseIconButton>
    </Styled.SearchResultsHeader>
    <SidebarSearchInput {...this.props} />
    <Styled.SearchQueryWrapper>
      <Styled.SearchQuery>
        <Styled.SearchIconInsideBar src={searchIcon} alt='' />
        <Styled.HeaderQuery role='note' tabIndex='0'>
          <FormattedMessage
            id='i18n:search-results:bar:query:results'
            values={{search: this.props.totalHits, terms: this.props.totalHitsKeyTerms}}
          />
          <strong> &lsquo;{this.props.query}&rsquo;</strong>
        </Styled.HeaderQuery>
      </Styled.SearchQuery>
    </Styled.SearchQueryWrapper>
  </Styled.SearchResultsTopBar>;

  public noResults = () => <div>
    <Styled.SearchResultsHeader emptyHeaderStyle={!this.props.searchInSidebar}>
      {this.props.searchInSidebar ? <Styled.SearchResultsHeaderTitle>
        <FormattedMessage id='i18n:search-results:bar:header:title:plain'>
          {(msg) => msg}
        </FormattedMessage>
      </Styled.SearchResultsHeaderTitle> : null}
      <Styled.CloseIconWrapper>
        <Styled.CloseIconButton
          onClick={this.props.onClose}
          data-testid='close-search-noresults'
        >
          <Styled.CloseIcon />
        </Styled.CloseIconButton>
      </Styled.CloseIconWrapper>
    </Styled.SearchResultsHeader>
    <SidebarSearchInput {...this.props} />
    <FormattedMessage id='i18n:search-results:bar:query:no-results'>
      {(msg) => (
        <Styled.SearchQuery>
          <Styled.SearchQueryAlignment>
            {msg} <strong> &lsquo;{this.props.query}&rsquo;</strong>
          </Styled.SearchQueryAlignment>
        </Styled.SearchQuery>
      )}
    </FormattedMessage>
  </div>;

  public resultContainers = (book: Book, results: SearchResultContainer[] | null) => {
    const displayRelatedKeyTerms = this.props.keyTermHits && this.props.keyTermHits.length > 0;
    const displaySearchResults = results && results.length > 0;
    const displaySearchResultsSectionTitle = displayRelatedKeyTerms && displaySearchResults;
    const sortedKeyTermHits = this.props.keyTermHits && this.props.keyTermHits.sort((a, b) =>
      assertDefined(a.highlight.title, 'highlight should have title')
      .localeCompare(assertDefined(b.highlight.title, 'highlight should have title')));

    return <Styled.NavWrapper aria-labelledby='search-results-title'>
      {displayRelatedKeyTerms && <RelatedKeyTerms
        book={book}
        selectedResult={this.props.selectedResult}
        keyTermHits={assertNotNull(sortedKeyTermHits, 'displayRelatedKeyTerms is true')}
      />}
      {displaySearchResultsSectionTitle && <Styled.SearchResultsSectionTitle tabIndex='0'>
        <FormattedMessage id='i18n:search-results:bar:title'>
          {(msg) => msg}
        </FormattedMessage>
      </Styled.SearchResultsSectionTitle>}
      <Styled.SearchResultsOl data-analytics-region='content-search-results'>
        {displaySearchResults && <SearchResultContainers
          activeSectionRef={this.activeSection}
          selectedResult={this.props.selectedResult}
          containers={assertNotNull(results, 'displaySearchResults is true')}
          book={book}
        />
        }
      </Styled.SearchResultsOl>
    </Styled.NavWrapper>;
  };

  public render() {
    const {
      results,
      book,
      onClose,
      query,
      nonKeyTermResults,
      totalHits,
      totalHitsKeyTerms,
      selectedResult,
      userSelectedResult,
      ...propsToForward
    } = this.props;
    return (
      <SearchResultsBar
        ref={this.searchSidebar}
        {...propsToForward}
      >
        {!query && !results ? this.blankState() : null}
        {query && !results ? <LoadingState onClose={onClose} /> : null}
        {results && results.length > 0 ? this.totalResults() : null}
        {results && results.length === 0 ? this.noResults() : null}
        {book && results && results.length > 0 ? this.resultContainers(book, nonKeyTermResults) : null}
      </SearchResultsBar>
    );
  }

  public componentDidMount = () => {
    if (this.props.userSelectedResult) {
      this.scrollToSelectedPage();
    }
    const searchSidebar = this.searchSidebar.current;

    if (!searchSidebar || typeof window === 'undefined') {
      return;
    }

    const {callback, deregister} = setSidebarHeight(searchSidebar, window);
    callback();
    this.deregister = deregister;

    searchSidebar.addEventListener('webkitAnimationEnd', fixSafariScrolling);
  };

  public componentDidUpdate() {
    if (this.props.userSelectedResult) {
      this.scrollToSelectedPage();
    }
  }

  public componentWillUnmount() {
    const searchSidebar = this.searchSidebar.current;
    this.deregister();

    if (!searchSidebar || typeof window === 'undefined') {
      return;
    }
    searchSidebar.removeEventListener('webkitAnimationEnd', fixSafariScrolling);

  }
  private deregister: () => void = () => null;

  private scrollToSelectedPage() {
    scrollSidebarSectionIntoView(
      this.searchSidebar.current,
      this.activeSection.current
    );
  }
}
