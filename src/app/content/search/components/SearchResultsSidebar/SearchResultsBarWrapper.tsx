import { SearchResultHit } from '@openstax/open-search-client';
import { HTMLElement } from '@openstax/types/lib.dom';
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
import { SearchResultContainer, SelectedResult } from '../../types';
import RelatedKeyTerms from './RelatedKeyTerms';
import SearchResultContainers from './SearchResultContainers';
import * as Styled from './styled';

interface ResultsSidebarProps {
  query: string | null;
  hasQuery: boolean;
  keyTermHits: SearchResultHit[] | null;
  nonKeyTermResults: SearchResultContainer[] | null;
  results: SearchResultContainer[] | null;
  onClose: () => void;
  searchResultsOpen: boolean;
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
  HTMLElement, {searchResultsOpen: boolean, hasQuery: boolean, children: React.ReactNode}
>(
  (props, ref) => <Styled.SearchResultsBar
    aria-label={useIntl().formatMessage({id: 'i18n:search-results:bar'})}
    data-testid='search-results-sidebar'
    ref={ref}
    {...props}
  />
);

export class SearchResultsBarWrapper extends Component<ResultsSidebarProps> {

  public searchSidebar = React.createRef<HTMLElement>();
  public activeSection = React.createRef<HTMLElement>();
  public searchSidebarHeader = React.createRef<HTMLElement>();

  public totalResults = () => <Styled.SearchResultsTopBar ref={this.searchSidebarHeader}>
    <Styled.SearchResultsHeader>
      <Styled.SearchResultsHeaderTitle>
        <FormattedMessage id='i18n:search-results:bar:header:title'>
          {(msg) => msg}
        </FormattedMessage>
      </Styled.SearchResultsHeaderTitle>
      <Styled.CloseIconButton
        onClick={this.props.onClose}
        data-testid='close-search'
      >
        <Styled.CloseIcon />
      </Styled.CloseIconButton>
    </Styled.SearchResultsHeader>
    <Styled.SearchQueryWrapper >
      <Styled.SearchQuery>
        <Styled.SearchIconInsideBar src={searchIcon}/>
        <Styled.HeaderQuery>
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
    <Styled.CloseIconWrapper>
      <Styled.CloseIconButton onClick={this.props.onClose}>
        <Styled.CloseIcon />
      </Styled.CloseIconButton>
    </Styled.CloseIconWrapper>
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

    return <Styled.NavWrapper>
      {displayRelatedKeyTerms && <RelatedKeyTerms
        book={book}
        selectedResult={this.props.selectedResult}
        keyTermHits={assertNotNull(sortedKeyTermHits, 'displayRelatedKeyTerms is true')}
      />}
      {displaySearchResultsSectionTitle && <Styled.SearchResultsSectionTitle>
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
        {!results ? <LoadingState onClose={onClose} /> : null}
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
