import { SearchResultHit } from '@openstax/open-search-client/dist/models/SearchResultHit';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Details } from '../../../components/Details';
import { AppState, Dispatch } from '../../../types';
import { clearSearch } from '../../search/actions';
import { isSearchResultChapter } from '../../search/guards';
import * as selectSearch from '../../search/selectors';
import { SearchResultChapter, SearchResultContainer, SearchResultPage } from '../../search/types';
import * as select from '../../selectors';
import { Book } from '../../types';
import { CollapseIcon, ExpandIcon, SummaryTitle, SummaryWrapper } from '../Sidebar/styled';
import { SearchResultsBarWrapper } from './SearchResultsBarWrapper';
import * as Styled from './styled';

// tslint:disable-next-line:variable-name
export const SearchResultContainers = (props: {containers: SearchResultContainer[], book: Book}) => <React.Fragment>
  {props.containers.map((node: SearchResultContainer) => isSearchResultChapter(node)
    ? <SearchResultsDropdown chapter={node} key={node.id} book={props.book}/>
    : <SearchResult page={node} key={node.id} book={props.book}/>
  )}
</React.Fragment>;

// tslint:disable-next-line:variable-name
const SearchResult = (props: {page: SearchResultPage, book: Book}) => <Styled.NavItem>
  <Styled.LinkWrapper>
    <Styled.SearchResultsLink dangerouslySetInnerHTML={{__html: props.page.title}} />
  </Styled.LinkWrapper>
  {props.page.results.map((hit: SearchResultHit) =>
    hit.source && hit.highlight && hit.highlight.visibleContent
      ? hit.highlight.visibleContent.map((highlight: string) =>
          <Styled.SectionContentPreview
              book={props.book}
              page={props.page}
              dangerouslySetInnerHTML={{__html: highlight}}/>
        )
      : []
  )}
</Styled.NavItem>;

// tslint:disable-next-line:variable-name
const SearchResultsDropdown = (props: {chapter: SearchResultChapter, book: Book}) => <li>
  <Details>
    <Styled.SearchBarSummary>
      <SummaryWrapper>
        <ExpandIcon/>
        <CollapseIcon/>
        <SummaryTitle dangerouslySetInnerHTML={{__html: props.chapter.title}} />
      </SummaryWrapper>
    </Styled.SearchBarSummary>
    <Styled.DetailsOl>
      <SearchResultContainers containers={props.chapter.contents} book={props.book} />
    </Styled.DetailsOl>
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
  public render() {
    const {query} = this.props;
    return query && <SearchResultsBarWrapper {...this.props}/>;
  }
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
