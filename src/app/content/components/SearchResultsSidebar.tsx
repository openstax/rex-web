import { SearchResultHit } from '@openstax/open-search-client/dist/models/SearchResultHit';
import { HTMLElement } from '@openstax/types/lib.dom';
import React, { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import styled, { css } from 'styled-components/macro';
import { Search } from 'styled-icons/fa-solid/Search';
import { Times } from 'styled-icons/fa-solid/Times/Times';
import { Details, iconSize } from '../../components/Details';
import { navDesktopHeight } from '../../components/NavBar';
import { labelStyle, textRegularLineHeight, textRegularStyle } from '../../components/Typography';
import theme from '../../theme';
import { AppState, Dispatch } from '../../types';
import { clearSearch } from '../search/actions';
import { isSearchResultChapter } from '../search/guards';
import * as selectSearch from '../search/selectors';
import { SearchResultChapter, SearchResultContainer, SearchResultPage } from '../search/types';
import * as select from '../selectors';
import { Book } from '../types';
import Loader from './../../components/Loader';
import {
  bookBannerDesktopMiniHeight,
  searchResultsBarDesktopWidth,
  toolbarDesktopHeight,
  toolbarMobileHeight,
  toolbarMobileSearchWrapperHeight,
  toolbarSearchInputMobileHeight,
} from './constants';
import ContentLinkComponent from './ContentLink';
import { CollapseIcon, ExpandIcon, Summary, SummaryTitle, SummaryWrapper } from './Sidebar/styled';
import { toolbarIconStyles } from './Toolbar';

const searchResultsBarVariables = {
    backgroundColor: '#f1f1f1',
    iconRightPadding: 0.7,
    mainPaddingDesktop: 3,
    mainPaddingMobile: 2,
    mainRightPaddingDesktop: 1.4,
};

// tslint:disable-next-line:variable-name
const SearchIconInsideBar = styled(Search)`
  ${toolbarIconStyles}
  color: ${theme.color.primary.gray.darker};
  margin-right: ${searchResultsBarVariables.iconRightPadding}rem;
  margin-left: ${searchResultsBarVariables.mainPaddingDesktop}rem;
`;

// tslint:disable-next-line:variable-name
const CloseIcon = styled(Times)`
  ${toolbarIconStyles}
  color: ${theme.color.primary.gray.lighter};
  margin-right: ${searchResultsBarVariables.mainRightPaddingDesktop}rem;
`;

// tslint:disable-next-line:variable-name
const NavOl = styled.ol`
  .os-divider {
    width: 0.4rem;
  }
`;

// tslint:disable-next-line:variable-name
const SearchResultsBar = styled.div`
  top: calc(${bookBannerDesktopMiniHeight + toolbarDesktopHeight}rem);
  margin-top: 0;
  padding: 0;
  position: sticky;
  width: ${searchResultsBarDesktopWidth}rem;
  background-color: ${searchResultsBarVariables.backgroundColor};
  box-shadow: 0.2rem 0 0.2rem 0 rgba(0, 0, 0, 0.1);
  z-index: 2;
  height: calc(100vh - ${navDesktopHeight + bookBannerDesktopMiniHeight
                        + toolbarDesktopHeight}rem);

  ${theme.breakpoints.mobile(css`
    position: fixed;
    right: 0;
    width: 100%;
    margin-top: ${toolbarMobileSearchWrapperHeight}rem;
    top: ${bookBannerDesktopMiniHeight
      + toolbarMobileHeight
      + toolbarSearchInputMobileHeight
      + toolbarMobileSearchWrapperHeight}rem;
    padding: 0;
  `)}

  > ${NavOl} {
    ::before {
      display: none;
    }
    margin: 0;
    padding: 0;
  }

`;

// tslint:disable-next-line:variable-name
const SearchQuery = styled.div`
  ${textRegularStyle}
  display: flex;
  align-items: center;
  justify-content: end;
  min-height: 4rem;

  strong {
    padding-left: 0.4rem;
  }
`;

// tslint:disable-next-line:variable-name
const SearchQueryWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  background: ${theme.color.neutral.base};
  padding: 1rem 0;
`;

// tslint:disable-next-line:variable-name
const SearchBarSummary = styled(Summary)`
    min-height: 3.8rem;
    display: flex;
    align-items: center;
    background: ${searchResultsBarVariables.backgroundColor};
    border-top: solid 0.1rem #d5d5d5;
    padding-left: ${searchResultsBarVariables.mainPaddingDesktop}rem;
`;

// tslint:disable-next-line:variable-name
const SearchResultsLink = styled.div`
  ${labelStyle}
  width: 100%;
`;

// tslint:disable-next-line:variable-name
const SectionContentPreview = styled(ContentLinkComponent)`
  ${labelStyle}
  margin-left: ${searchResultsBarVariables.mainPaddingDesktop + iconSize + 2.3}rem;
  min-height: 3.7rem;
  align-items: center;
  padding-right: 1.6rem;
  padding: 1rem 0;
  max-width: 35.3rem;
  display: block;
  text-decoration: none;

  :not(:last-child) {
    border-bottom: solid 0.1rem ${searchResultsBarVariables.backgroundColor};
  }

  em {
    font-weight: bold;
  }
`;

// tslint:disable-next-line:variable-name
const LinkWrapper = styled.div`
    min-height: 3.4rem;
    display: flex;
    align-items: center;
    padding-left: ${searchResultsBarVariables.mainPaddingDesktop + iconSize}rem;
    padding-top: 1rem;
    padding-bottom: 0.6rem;
`;

// tslint:disable-next-line:variable-name
const DetailsOl = styled.ol`
  padding: 0;
`;

// tslint:disable-next-line:variable-name
const NavItem = styled.li`
  background: ${theme.color.primary.gray.foreground};
  :not(:last-child) {
    border-bottom: solid 0.2rem ${searchResultsBarVariables.backgroundColor};
  }
`;

// tslint:disable-next-line:variable-name
const SearchQueryAlignment = styled.div`
  max-width: 26.5rem;
  text-align: justify;
  /*textRegularLineHeight is the close icon height*/
  margin-top: calc(7rem - ${textRegularLineHeight}rem);
  margin-left: auto;
  margin-right: auto;
`;

// tslint:disable-next-line:variable-name
const CloseIconWrapper = styled.div`
  display: flex;
  justify-content: flex-end;
`;

// tslint:disable-next-line:variable-name
const LoadingWrapper = styled.div`
  overflow: hidden;
  right: 0;
  top: 0;
  position: absolute;
  transition: opacity 0.2s;
  width: 100%;
  height: 100%;
  background-color: ${searchResultsBarVariables.backgroundColor};
  z-index: 5;
  transition: opacity 0.5s 0.3s, transform 0.2s 0.2s;
`;

// tslint:disable-next-line:variable-name
const CloseIconButton = styled.button`
  border: none;
  padding: 0;
  margin: 0;
  background: transparent;
`;

// tslint:disable-next-line:variable-name
const HeaderQuery = styled.div`
  max-width: calc(${searchResultsBarDesktopWidth - (textRegularLineHeight * 2)
              - searchResultsBarVariables.mainPaddingDesktop
              - searchResultsBarVariables.mainRightPaddingDesktop}rem)
`;

// tslint:disable-next-line:variable-name
const SearchResultContainers = (props: {containers: SearchResultContainer[], book: Book}) => <React.Fragment>
  {props.containers.map((node: SearchResultContainer) => isSearchResultChapter(node)
    ? <SearchResultsDropdown chapter={node} key={node.id} book={props.book}/>
    : <SearchResult page={node} key={node.id} book={props.book}/>
  )}
</React.Fragment>;

// tslint:disable-next-line:variable-name
const SearchResult = (props: {page: SearchResultPage, book: Book}) => <NavItem>
  <LinkWrapper>
    <SearchResultsLink dangerouslySetInnerHTML={{__html: props.page.title}} />
  </LinkWrapper>
  {props.page.results.map((hit: SearchResultHit) =>
    hit.source && hit.highlight && hit.highlight.visibleContent
      ? hit.highlight.visibleContent.map((highlight: string) =>
          <SectionContentPreview
              book={props.book}
              page={props.page}
              dangerouslySetInnerHTML={{__html: highlight}}/>
        )
      : []
  )}
</NavItem>;

// tslint:disable-next-line:variable-name
const SearchResultsDropdown = (props: {chapter: SearchResultChapter, book: Book}) => <li>
  <Details>
    <SearchBarSummary>
      <SummaryWrapper>
        <ExpandIcon/>
        <CollapseIcon/>
        <SummaryTitle dangerouslySetInnerHTML={{__html: props.chapter.title}} />
      </SummaryWrapper>
    </SearchBarSummary>
    <DetailsOl>
      <SearchResultContainers containers={props.chapter.contents} book={props.book} />
    </DetailsOl>
  </Details>
</li>;

interface SearchResultsSidebarProps {
  query: string | null;
  totalHits: number | null;
  results: SearchResultContainer[] | null;
  onClose: () => void;
  book?: Book;
}

export class SearchResultsSidebar extends Component<SearchResultsSidebarProps> {
  public searchSidebar = React.createRef<HTMLElement>();

  public render() {
    const {query, totalHits, results, onClose, book} = this.props;
    return !query ? <SearchResultsBar ref={this.searchSidebar}></SearchResultsBar>
    : <SearchResultsBar ref={this.searchSidebar}>
      {!results && <LoadingWrapper>
        <CloseIconWrapper>
          <CloseIconButton onClick={onClose}><CloseIcon /></CloseIconButton>
        </CloseIconWrapper>
        <Loader/>
      </LoadingWrapper>}
      {totalHits && <SearchQueryWrapper>
        <FormattedMessage id='i18n:search-results:bar:query:results'>
          {(msg: Element | string) =>
            <SearchQuery>
              <SearchIconInsideBar />
              <HeaderQuery>
                {totalHits} {msg} <strong> &lsquo;{query}&rsquo;</strong>
              </HeaderQuery>
            </SearchQuery>
          }
        </FormattedMessage>
        <CloseIconButton onClick={onClose}><CloseIcon /></CloseIconButton>
      </SearchQueryWrapper>}
      {!totalHits && <div>
        <CloseIconWrapper>
          <CloseIconButton onClick={onClose}><CloseIcon /></CloseIconButton>
        </CloseIconWrapper>
        <FormattedMessage id='i18n:search-results:bar:query:no-results'>
          {(msg: Element | string) =>
            <SearchQuery>
              <SearchQueryAlignment>{msg} <strong> &lsquo;{query}&rsquo;</strong></SearchQueryAlignment>
            </SearchQuery>
          }
        </FormattedMessage>
      </div>}
      {book && results && totalHits && <NavOl>
        <SearchResultContainers containers={results} book={book} />
      </NavOl>}
    </SearchResultsBar>;
  }

  public componentDidMount = () => {
    const searchSidebar = this.searchSidebar.current;

    if (!searchSidebar || typeof(window) === 'undefined') {
      return;
    }

    const scrollHandler = () => {
      const top = searchSidebar.getBoundingClientRect().top;
      searchSidebar.style.setProperty('height', `calc(100vh - ${top}px)`);
    };

    const animation = () => requestAnimationFrame(scrollHandler);

    window.addEventListener('scroll', animation, {passive: true});
    window.addEventListener('resize', animation, {passive: true});
    scrollHandler();
  };

}

export default connect(
  (state: AppState) => ({
    book: select.book(state),
    query: selectSearch.query(state),
    results: selectSearch.results(state),
    totalHits: selectSearch.totalHits(state),
  }),
  (dispatch: Dispatch) => ({
    onClose: () => {
      dispatch(clearSearch());
    },
  })
)(SearchResultsSidebar);
