
import { HTMLElement } from '@openstax/types/lib.dom';
import React, { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import { SearchResultContainers } from '.';
import Loader from '../../../components/Loader';
import { SearchResultContainer } from '../../search/types';
import { Book } from '../../types';
import * as Styled from './styled';

interface SearchResultsSidebarProps {
  query: string | null;
  totalHits: number | null;
  results: SearchResultContainer[] | null;
  onClose: () => void;
  book?: Book;
}

export class SearchResultsBarWrapper extends Component<SearchResultsSidebarProps> {
  public searchSidebar = React.createRef<HTMLElement>();

  public render() {
    const {query, totalHits, results, onClose, book} = this.props;

    return <Styled.SearchResultsBar ref={this.searchSidebar}>
      {!results && <Styled.LoadingWrapper>
        <Styled.CloseIconWrapper>
          <Styled.CloseIconButton onClick={onClose}><Styled.CloseIcon /></Styled.CloseIconButton>
        </Styled.CloseIconWrapper>
        <Loader/>
      </Styled.LoadingWrapper>}
      {totalHits && <Styled.SearchQueryWrapper>
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
      </Styled.SearchQueryWrapper>}
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
      {book && results && totalHits && <Styled.NavOl>
        <SearchResultContainers containers={results} book={book} />
      </Styled.NavOl>}
      </Styled.SearchResultsBar>;
  }

  public componentDidMount = () => {
    const searchSidebar = this.searchSidebar.current;

    if (!searchSidebar || typeof(window) === 'undefined') {
      return;
    }

    const scrollHandler = () => {
      const top = searchSidebar.getBoundingClientRect().top;
      console.log(top);
      searchSidebar.style.setProperty('height', `calc(100vh - ${top}px)`);
      searchSidebar.style.setProperty('top', `calc(${top}px)`);
    };

    const animation = () => requestAnimationFrame(scrollHandler);

    window.addEventListener('scroll', animation, {passive: true});
    window.addEventListener('resize', animation, {passive: true});
    scrollHandler();
  };
}
