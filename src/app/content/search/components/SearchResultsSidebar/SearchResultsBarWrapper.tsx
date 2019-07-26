import { HTMLElement } from '@openstax/types/lib.dom';
import React, { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import Loader from '../../../../components/Loader';
import { Book, Page } from '../../../types';
import { scrollHandler } from '../../../utils/domUtils';
import { SearchResultContainer } from '../../types';
import { SearchResultContainers } from './SearchResultContainers';
import * as Styled from './styled';

interface ResultsSidebarProps {
  currentPage: Page | undefined;
  query: string | null;
  totalHits: number | null;
  results: SearchResultContainer[] | null;
  onClose: () => void;
  closeSearchResults: () => void;
  mobileOpen: boolean;
  book?: Book;
}

export class SearchResultsBarWrapper extends Component<ResultsSidebarProps> {
  public searchSidebar = React.createRef<HTMLElement>();

  public render() {
    const {currentPage, query, totalHits, results, onClose, book, closeSearchResults} = this.props;

    return <Styled.SearchResultsBar ref={this.searchSidebar}>
      {!results ? <Styled.LoadingWrapper>
        <Styled.CloseIconWrapper>
          <Styled.CloseIconButton onClick={onClose}><Styled.CloseIcon /></Styled.CloseIconButton>
        </Styled.CloseIconWrapper>
        <Loader/>
      </Styled.LoadingWrapper> : null }
      {totalHits ? <Styled.SearchQueryWrapper>
        <FormattedMessage id='i18n:search-results:bar:query:results'>
          {(msg: Element | string) =>
            <Styled.SearchQuery>
              <Styled.SearchIconInsideBar />
              <Styled.HeaderQuery>
                {totalHits} {msg} <strong> &lsquo;{query}&rsquo;</strong>
              </Styled.HeaderQuery>
            </Styled.SearchQuery>
          }
        </FormattedMessage>
        <Styled.CloseIconButton onClick={onClose}><Styled.CloseIcon /></Styled.CloseIconButton>
      </Styled.SearchQueryWrapper> : null }
      {!totalHits && <div>
        <Styled.CloseIconWrapper>
          <Styled.CloseIconButton onClick={onClose}><Styled.CloseIcon /></Styled.CloseIconButton>
        </Styled.CloseIconWrapper>
        <FormattedMessage id='i18n:search-results:bar:query:no-results'>
          {(msg: Element | string) =>
            <Styled.SearchQuery>
              <Styled.SearchQueryAlignment>{msg} <strong> &lsquo;{query}&rsquo;</strong></Styled.SearchQueryAlignment>
            </Styled.SearchQuery>
          }
        </FormattedMessage>
      </div>}
      {book && results && results.length > 0 && totalHits && <Styled.NavOl>
        <SearchResultContainers currentPage={currentPage}
        containers={results} book={book} closeSearchResults={closeSearchResults}/>
      </Styled.NavOl>}
      </Styled.SearchResultsBar>;
  }

  public componentDidMount = () => {
    const searchSidebar = this.searchSidebar.current;

    if (!searchSidebar || typeof(window) === 'undefined') {
      return;
    }

    const scrollHandlerCallback = () => {
      scrollHandler(searchSidebar);
    };

    const animation = () => requestAnimationFrame(scrollHandlerCallback);

    window.addEventListener('scroll', animation, {passive: true});
    window.addEventListener('resize', animation, {passive: true});
    scrollHandlerCallback();
  };
}
