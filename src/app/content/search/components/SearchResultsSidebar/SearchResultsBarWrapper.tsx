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
import * as TopbarStyled from '../../../components/Topbar/styled';
import { requestSearch } from '../../actions';
import { isHtmlElement } from '../../../../guards';
import { assertDocument } from '../../../../utils';
import styled, { css } from 'styled-components';
import theme from '../../../../theme';

interface ResultsSidebarProps {
  query: string | null;
  hasQuery: boolean;
  keyTermHits: SearchResultHit[] | null;
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

interface State {
  query: string;
  queryProp: string;
  formSubmitted: boolean;
}

// tslint:disable-next-line: variable-name
const BlankState = ({onClose, ref, searchInput}: {
  onClose: () => void; ref: React.Ref<HTMLElement>; searchInput: () => React.ReactNode
}) => <Styled.BlankStateWrapper>
<Styled.SearchResultsTopBar ref={ref}>
    <Styled.SearchResultsHeader>
      <Styled.SearchResultsHeaderTitle>
        <FormattedMessage id='i18n:search-results:bar:header:title:plain'>
          {(msg) => msg}
        </FormattedMessage>
      </Styled.SearchResultsHeaderTitle>
      <Styled.CloseIconButton
        onClick={onClose}
        data-testid='close-search'
      >
        <Styled.CloseIcon />
      </Styled.CloseIconButton>
    </Styled.SearchResultsHeader>
    <Styled.SearchQueryWrapper >
      {searchInput()}
    </Styled.SearchQueryWrapper>
  </Styled.SearchResultsTopBar>

  <Styled.BlankStateMessage>
    {useIntl().formatMessage({id: 'i18n:search-results:blank-state'})}
  </Styled.BlankStateMessage>
</Styled.BlankStateWrapper>

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

const StyledSearchWrapper = styled.div`
  flex: 1;
  padding: 1.6rem;
  ${(props: { background: boolean }) => props.background && css`
    background: ${theme.color.white};
    border-bottom: 0.1rem solid ${theme.color.neutral.formBorder};
  `}
  ${TopbarStyled.SearchInputWrapper} {
    margin: 0;
    width: 100%;
    background: ${theme.color.white};
  }
  ${theme.breakpoints.mobileMedium(css`
    display: none;
  `)}
`;

const StyledSearchCloseButton = styled(TopbarStyled.CloseButton)`
  ${(props) => !props.formSubmitted && theme.breakpoints.mobile(css`
    display: block;
  `)}
`;

const StyledSearchCloseButtonNew = styled(TopbarStyled.CloseButtonNew)`
  ${(props) => !props.formSubmitted && theme.breakpoints.mobile(css`
    display: block;
  `)}
`;

export class SearchResultsBarWrapper extends Component<ResultsSidebarProps> {

  public searchSidebar = React.createRef<HTMLElement>();
  public activeSection = React.createRef<HTMLElement>();
  public searchSidebarHeader = React.createRef<HTMLElement>();

  public headerTitle = `i18n:search-results:bar:header:title:${this.props.searchInSidebar ? 'plain' : 'results'}`;

  public static getDerivedStateFromProps(newProps: ResultsSidebarProps, state: State) {
    if (newProps.query && newProps.query !== state.queryProp && newProps.query !== state.query) {
      return { ...state, query: newProps.query, queryProp: newProps.query };
    }
    return { ...state, queryProp: newProps.query };
  }

  public state = { query: '', queryProp: '', formSubmitted: false };

  public onSearchChange = (e: React.FormEvent<HTMLInputElement>) => {
    this.setState({ query: (e.currentTarget as any).value, formSubmitted: false });
  };

  public newButtonEnabled = !!this.props.searchButtonColor;

  public sidebarSearchInput = () => {
    if (!this.props.searchInSidebar) {
      return null;
    }
    return <StyledSearchWrapper background={this.props.query}>
      <TopbarStyled.SearchInputWrapper
        action='#'
        onSubmit={this.onSearchSubmit}
        data-testid='sidebar-search'
        data-experiment
        colorSchema={this.props.searchButtonColor}
      >
        <TopbarStyled.SearchInput type='search' data-testid='sidebar-search-input'
          autoFocus
          onChange={this.onSearchChange} value={this.state.query} />
          {!this.state.formSubmitted && !this.newButtonEnabled &&
            <TopbarStyled.SearchButton colorSchema={this.props.searchButtonColor} data-experiment />
          }
          {this.state.formSubmitted && !this.newButtonEnabled &&
            <StyledSearchCloseButton type='button' onClick={this.onSearchClear} data-testid='sidebar-clear-search' />
          }
          {this.state.formSubmitted && this.newButtonEnabled &&
            <StyledSearchCloseButtonNew type='button' onClick={this.onSearchClear} data-testid='sidebar-clear-search'>
              <Styled.CloseIcon />
            </StyledSearchCloseButtonNew>
          }
          {this.newButtonEnabled &&
            <TopbarStyled.SearchButton desktop colorSchema={this.props.searchButtonColor} data-experiment />
          }
      </TopbarStyled.SearchInputWrapper>
    </StyledSearchWrapper>;
  }

  public onSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const activeElement = assertDocument().activeElement;
    if (this.state.query) {
      if (isHtmlElement(activeElement)) {
        activeElement.blur();
      }
      this.props.search(this.state.query);
      this.setState({ formSubmitted: true });
    }
  };

  public onSearchClear = (e: React.FormEvent) => {
    e.preventDefault();
    this.setState({ query: '', formSubmitted: false });
  };

  public totalResults = () => <Styled.SearchResultsTopBar ref={this.searchSidebarHeader}>
    <Styled.SearchResultsHeader>
      <Styled.SearchResultsHeaderTitle>
        <FormattedMessage id={this.headerTitle}>
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
    {this.sidebarSearchInput()}
    <Styled.SearchQueryWrapper>
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
    <Styled.SearchResultsHeader emptyHeaderStyle={!this.props.searchInSidebar}>
      {this.props.searchInSidebar ? <Styled.SearchResultsHeaderTitle>
        <FormattedMessage id='i18n:search-results:bar:header:title:plain'>
          {(msg) => msg}
        </FormattedMessage>
      </Styled.SearchResultsHeaderTitle> : null}
      <Styled.CloseIconWrapper>
        <Styled.CloseIconButton onClick={this.props.onClose}>
          <Styled.CloseIcon />
        </Styled.CloseIconButton>
      </Styled.CloseIconWrapper>
    </Styled.SearchResultsHeader>
    {this.sidebarSearchInput()}
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
        {!query && !results ? <BlankState onClose={onClose} ref={this.searchSidebarHeader} searchInput={this.sidebarSearchInput} /> : null}
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
