import { HTMLElement } from '@openstax/types/lib.dom';
import React, { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import Loader from '../../../../components/Loader';
import { assertDefined } from '../../../../utils';
import { Book, Page } from '../../../types';
import {
  scrollSidebarSectionIntoView,
  setSidebarHeight
} from '../../../utils/domUtils';
import { SearchResultContainer } from '../../types';
import { SearchResultContainers } from './SearchResultContainers';
import * as Styled from './styled';

interface ResultsSidebarProps {
  closed: boolean;
  currentPage: Page | undefined;
  query: string | null;
  results: SearchResultContainer[] | null;
  onClose: () => void;
  closeSearchResults: () => void;
  searchResultsOpen: boolean;
  book?: Book;
}

export class SearchResultsBarWrapper extends Component<ResultsSidebarProps> {

  private searchSidebar = React.createRef<HTMLElement>();
  private activeSection = React.createRef<HTMLElement>();

  public loadindState = () => <FormattedMessage id='i18n:search-results:bar:loading-state'>
    {(msg: Element | string) => <Styled.LoadingWrapper aria-label={msg}>
      <Styled.CloseIconWrapper>
        <Styled.CloseIconButton onClick={this.props.onClose}>
          <Styled.CloseIcon />
        </Styled.CloseIconButton>
      </Styled.CloseIconWrapper>
      <Loader />
    </Styled.LoadingWrapper>}
  </FormattedMessage>;

  public totalResults = () => <Styled.SearchQueryWrapper>
    <FormattedMessage id='i18n:search-results:bar:query:results'>
      {(msg: Element | string) => (
        <Styled.SearchQuery>
          <Styled.SearchIconInsideBar />
          <Styled.HeaderQuery>
            {this.props.results && this.props.results.length} {msg}{' '}
            <strong> &lsquo;{this.props.query}&rsquo;</strong>
          </Styled.HeaderQuery>
          <Styled.CloseIconButton
            onClick={this.props.onClose}
            data-testid='close-search'
            aria-label='Close search sidebar'
          >
            <Styled.CloseIcon />
          </Styled.CloseIconButton>
        </Styled.SearchQuery>
      )}
    </FormattedMessage>
  </Styled.SearchQueryWrapper>;

  public noResults = () => <div>
    <Styled.CloseIconWrapper>
      <Styled.CloseIconButton onClick={this.props.onClose}>
        <Styled.CloseIcon />
      </Styled.CloseIconButton>
    </Styled.CloseIconWrapper>
    <FormattedMessage id='i18n:search-results:bar:query:no-results'>
      {(msg: Element | string) => (
        <Styled.SearchQuery>
          <Styled.SearchQueryAlignment>
            {msg} <strong> &lsquo;{this.props.query}&rsquo;</strong>
          </Styled.SearchQueryAlignment>
        </Styled.SearchQuery>
      )}
    </FormattedMessage>
  </div>;

  public resultContainers = (book: Book, results: SearchResultContainer[]) => <Styled.NavOl>
    <SearchResultContainers
      currentPage={this.props.currentPage}
      activeSectionRef={this.activeSection}
      containers={results}
      book={book}
      closeSearchResults={this.props.closeSearchResults}
    />
  </Styled.NavOl>;

  public render() {
    const { results, book, searchResultsOpen, closed } = this.props;

    return (
      <FormattedMessage id='i18n:search-results:bar'>
        {(msg: Element | string) => (
          <Styled.SearchResultsBar
            closed={closed}
            aria-label={msg}
            searchResultsOpen={searchResultsOpen}
            ref={this.searchSidebar}
            data-testid='search-results-sidebar'
          >
            {!results ? this.loadindState() : null}
            {results && results.length > 0 ? this.totalResults() : null}
            {results && results.length === 0 ? this.noResults() : null}
            {book && results && results.length > 0 ? this.resultContainers(book, results) : null}
          </Styled.SearchResultsBar>
        )}
      </FormattedMessage>
    );
  }

  public componentDidMount = () => {
    this.scrollToSelectedPage();
    const searchSidebar = this.searchSidebar.current;

    if (!searchSidebar || typeof window === 'undefined') {
      return;
    }

    const {callback, deregister} = setSidebarHeight(searchSidebar, window);
    callback();
    this.deregister = deregister;
  };

  public componentDidUpdate() {
    this.scrollToSelectedPage();

    const activeSection = this.activeSection.current;
    if (activeSection) {
      const firstResult = assertDefined(activeSection.querySelector('a'),
        'there should always be at least one result if there is an active section'
      );
      firstResult.focus();
    }

  }

  public componentWillUnmount() {
    this.deregister();
  }
  private deregister: () => void = () => null;

  private scrollToSelectedPage() {
    scrollSidebarSectionIntoView(
      this.searchSidebar.current,
      this.activeSection.current
    );
  }
}
