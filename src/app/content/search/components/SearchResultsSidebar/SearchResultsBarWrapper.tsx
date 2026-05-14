import { SearchResultHit } from '@openstax/open-search-client';
import { HTMLElement, HTMLDivElement } from '@openstax/types/lib.dom';
import classNames from 'classnames';
import React, { Component } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import searchIcon from '../../../../../assets/search-icon-v2.svg';
import Times from '../../../../components/Times';
import Loader from '../../../../components/Loader';
import { assertDefined, assertNotNull } from '../../../../utils/assertions';
import theme from '../../../../theme';
import { Book, BookWithOSWebData } from '../../../types';
import {
    fixSafariScrolling,
    scrollSidebarSectionIntoView,
    setSidebarHeight,
} from '../../../utils/domUtils';
import { requestSearch } from '../../actions';
import { SearchResultContainer, SelectedResult } from '../../types';
import RelatedKeyTerms from './RelatedKeyTerms';
import SearchResultContainers from './SearchResultContainers';
import { SidebarSearchInput } from './SidebarSearchInput';
import { Details as BaseDetails } from '../../../../components/Details';
import { Summary } from '../../../../components/Details.legacy';
import './SearchResultsSidebar.css';

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
  searchButtonColor: BookWithOSWebData['theme'] | null;
  book?: Book;
  totalHits: number | null;
  totalHitsKeyTerms: number | null;
  selectedResult: SelectedResult | null;
  userSelectedResult: boolean;
}

type LabeledCloseButtonParameters = {
  onClose: () => void,
  testId?: string
}

// CloseIcon component - replaces Styled.CloseIcon
const CloseIcon = (props: React.SVGAttributes<SVGSVGElement>) => (
  <Times {...props} className="close-icon" aria-hidden='true' focusable='false' />
);

function LabeledCloseButton({onClose, testId}: LabeledCloseButtonParameters) {
  return <button
    className="close-icon-button"
    onClick={onClose}
    data-testid={testId}
    aria-label={useIntl().formatMessage({id: 'i18n:toolbar:search:toggle:close'})}
  >
    <CloseIcon />
  </button>;
}

const LoadingState = ({onClose}: LabeledCloseButtonParameters) => <div
  className="loading-wrapper"
  aria-label={useIntl().formatMessage({id: 'i18n:search-results:bar:loading-state'})}
>
  <div className="close-icon-wrapper">
      <LabeledCloseButton onClose={onClose} />
  </div>
  <Loader />
</div>;

/**
 * Header component with dynamic title and close button
 */
const SearchResultsHeader = ({
  titleMessageId,
  searchInSidebar,
  onClose,
  testId = 'close-search',
  emptyHeaderStyle = false,
}: {
  titleMessageId?: string;
  searchInSidebar: boolean;
  onClose: () => void;
  testId?: string;
  emptyHeaderStyle?: boolean;
}) => {
  const defaultTitle = `i18n:search-results:bar:header:title:${searchInSidebar ? 'plain' : 'results'}`;

  return (
    <div className={classNames('search-results-header', { 'search-results-header--empty': emptyHeaderStyle })}>
      <h2 className="search-results-header-title" id='search-results-title'>
        <FormattedMessage id={titleMessageId || defaultTitle}>
          {(msg) => msg}
        </FormattedMessage>
      </h2>
      <LabeledCloseButton
        onClose={onClose}
        testId={testId}
      />
    </div>
  );
};

/**
 * Initial empty state before any search is performed
 */
const BlankState = ({
  searchSidebarHeaderRef,
  props,
}: {
  searchSidebarHeaderRef: React.RefObject<HTMLElement>;
  props: ResultsSidebarProps;
}) => (
  <div className="blank-state-wrapper">
    <div className="search-results-top-bar" ref={searchSidebarHeaderRef}>
      <SearchResultsHeader
        titleMessageId='i18n:search-results:bar:header:title:plain'
        searchInSidebar={props.searchInSidebar}
        onClose={props.onClose}
      />
      <div className="search-query-wrapper">
        <SidebarSearchInput {...props} />
      </div>
    </div>

    <div className="blank-state-message" role='status'>
      <FormattedMessage id='i18n:search-results:bar:blank-state' />
    </div>
  </div>
);

/**
 * Message displayed when search returns no results
 */
const NoResults = ({
  props,
}: {
  props: ResultsSidebarProps;
}) => (
  <div>
    {props.searchInSidebar ? (
      <SearchResultsHeader
        titleMessageId='i18n:search-results:bar:header:title:plain'
        searchInSidebar={props.searchInSidebar}
        onClose={props.onClose}
      />
    ) : (
      <SearchResultsHeader
        titleMessageId='i18n:search-results:bar:header:title:plain'
        searchInSidebar={props.searchInSidebar}
        onClose={props.onClose}
        testId='close-search-noresults'
        emptyHeaderStyle={true}
      />
    )}
    <SidebarSearchInput {...props} />
    <FormattedMessage id='i18n:search-results:bar:query:no-results'>
      {(msg) => (
        <div className="search-query" role='status'>
          <div className="search-query-alignment">
            {msg} <strong> &lsquo;{props.query}&rsquo;</strong>
          </div>
        </div>
      )}
    </FormattedMessage>
  </div>
);

/**
 * Summary header showing search query and result counts
 */
const ResultsSummary = ({
  searchSidebarHeaderRef,
  props,
}: {
  searchSidebarHeaderRef: React.RefObject<HTMLElement>;
  props: ResultsSidebarProps;
}) => (
  <div className="search-results-top-bar" ref={searchSidebarHeaderRef}>
    <SearchResultsHeader
      searchInSidebar={props.searchInSidebar}
      onClose={props.onClose}
    />
    <SidebarSearchInput {...props} />
    <div className="search-query-wrapper">
      <div className="search-query">
        <img className="search-icon-inside-bar" src={searchIcon} alt='' />
        <div className="header-query" role='note' tabIndex={0}>
          <FormattedMessage
            id='i18n:search-results:bar:query:results'
            values={{search: props.totalHits, terms: props.totalHitsKeyTerms}}
          />
          <strong> &lsquo;{props.query}&rsquo;</strong>
        </div>
      </div>
    </div>
  </div>
);

/**
 * List of search results including key terms and regular results
 */
const ResultsList = ({
  book,
  results,
  keyTermHits,
  selectedResult,
  activeSectionRef,
}: {
  book: Book;
  results: SearchResultContainer[] | null;
  keyTermHits: SearchResultHit[] | null;
  selectedResult: SelectedResult | null;
  activeSectionRef: React.RefObject<HTMLElement>;
}) => {
  const displayRelatedKeyTerms = keyTermHits && keyTermHits.length > 0;
  const displaySearchResults = results && results.length > 0;
  const displaySearchResultsSectionTitle = displayRelatedKeyTerms && displaySearchResults;
  const sortedKeyTermHits = keyTermHits && keyTermHits.sort((a, b) =>
    assertDefined(a.highlight.title, 'highlight should have title')
    .localeCompare(assertDefined(b.highlight.title, 'highlight should have title')));

  return (
    <nav className="nav-wrapper" aria-labelledby='search-results-title'>
      {displayRelatedKeyTerms && <RelatedKeyTerms
        book={book}
        selectedResult={selectedResult}
        keyTermHits={assertNotNull(sortedKeyTermHits, 'displayRelatedKeyTerms is true')}
      />}
      {displaySearchResultsSectionTitle && <h3 className="search-results-section-title" tabIndex={0}>
        <FormattedMessage id='i18n:search-results:bar:title'>
          {(msg) => msg}
        </FormattedMessage>
      </h3>}
      <ol className="search-results-ol" data-analytics-region='content-search-results'>
        {displaySearchResults && <SearchResultContainers
          activeSectionRef={activeSectionRef}
          selectedResult={selectedResult}
          containers={assertNotNull(results, 'displaySearchResults is true')}
          book={book}
        />
        }
      </ol>
    </nav>
  );
};

const SearchResultsBar = React.forwardRef<
  HTMLElement, {
    mobileToolbarOpen: boolean,
    searchResultsOpen: boolean,
    hasQuery: boolean,
    children: React.ReactNode,
  }
>(
  (props, ref) => {
    const { mobileToolbarOpen, searchResultsOpen, hasQuery, children, ...restProps } = props;

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

    // Determine when search is closed
    const isClosed = !searchResultsOpen && !hasQuery;

    // Determine when mobile toolbar is effectively closed
    const isMobileToolbarClosed = !mobileToolbarOpen || (mobileToolbarOpen && !hasQuery);

    return (
      <div
        {...restProps}
        id='search-results-sidebar'
        className={classNames('search-results-bar', {
          'search-results-bar--closed': isClosed,
          'search-results-bar--mobile-toolbar-closed': isMobileToolbarClosed,
        })}
        aria-label={useIntl().formatMessage({id: 'i18n:search-results:bar'})}
        aria-live='polite'
        data-testid='search-results-sidebar'
        ref={ref}
        tabIndex={-1}
        onFocus={forwardFocus}
        style={{
          '--search-results-bar-z-index': theme.zIndex.sidebar,
          '--search-results-bar-z-index-mobile': theme.zIndex.sidebar,
        } as React.CSSProperties}
      >
        {children}
      </div>
    );
  }
);

export class SearchResultsBarWrapper extends Component<ResultsSidebarProps> {

  public searchSidebar = React.createRef<HTMLElement>();
  public activeSection = React.createRef<HTMLElement>();
  public searchSidebarHeader = React.createRef<HTMLElement>();

  public blankState = () => <BlankState searchSidebarHeaderRef={this.searchSidebarHeader} props={this.props} />;

  public totalResults = () => <ResultsSummary searchSidebarHeaderRef={this.searchSidebarHeader} props={this.props} />;

  public noResults = () => <NoResults props={this.props} />;

  public resultContainers = (book: Book, results: SearchResultContainer[] | null) => (
    <ResultsList
      book={book}
      results={results}
      keyTermHits={this.props.keyTermHits}
      selectedResult={this.props.selectedResult}
      activeSectionRef={this.activeSection}
    />
  );

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
