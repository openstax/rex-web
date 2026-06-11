import React from 'react';
import { useIntl } from 'react-intl';
import { connect } from 'react-redux';
import { CollapseIcon, ExpandIcon } from '../../../../components/Details';
import { Details as BaseDetails } from '../../../../components/Details';
import { Summary } from '../../../../components/Details.legacy';
import { AppState, Dispatch, FirstArgumentType } from '../../../../types';
import * as select from '../../../selectors';
import { Book, Page } from '../../../types';
import { stripIdVersion } from '../../../utils/idUtils';
import { closeSearchResultsMobile, selectSearchResult } from '../../actions';
import { isSearchResultChapter } from '../../guards';
import * as selectSearch from '../../selectors';
import { SearchResultChapter, SearchResultContainer, SearchResultPage, SelectedResult } from '../../types';
import SearchResultHits from './SearchResultHits';
import './SearchResultsSidebar.css';

interface SearchResultContainersProps {
  currentPage: Page | undefined;
  currentQuery: string | null;
  containers: SearchResultContainer[];
  book: Book;
  selectedResult: SelectedResult | null;
  selectResult: (payload: FirstArgumentType<typeof selectSearchResult>) => void;
  activeSectionRef: React.RefObject<HTMLAnchorElement>;
}
const SearchResultContainers = ({containers, ...props}: SearchResultContainersProps) => (
  <React.Fragment>
    {containers.map((node: SearchResultContainer) =>
      isSearchResultChapter(node) ? (
        <SearchResultsDropdown
          currentPage={props.currentPage}
          currentQuery={props.currentQuery}
          chapter={node}
          book={props.book}
          selectResult={props.selectResult}
          selectedResult={props.selectedResult}
          activeSectionRef={props.activeSectionRef}
          key={node.id}
        />
      ) : (
        <SearchResult
          currentPage={props.currentPage}
          currentQuery={props.currentQuery}
          page={node}
          book={props.book}
          selectResult={props.selectResult}
          selectedResult={props.selectedResult}
          activeSectionRef={props.activeSectionRef}
          key={node.id}
        />
      )
    )}
  </React.Fragment>
);

const SearchResult = (props: {
  currentPage: Page | undefined;
  currentQuery: string | null;
  page: SearchResultPage;
  book: Book;
  selectResult: (payload: FirstArgumentType<typeof selectSearchResult>) => void;
  selectedResult: SelectedResult | null;
  activeSectionRef: React.RefObject<HTMLAnchorElement>;
}) => {
  const formatMessage = useIntl().formatMessage;
  const active = props.page && props.currentPage
    && stripIdVersion(props.currentPage.id) === stripIdVersion(props.page.id);
  const selectResultAndFocus = React.useCallback(
    (result: SelectedResult) => {
      props.selectResult(result);
    },
    [props]
  );

  return <li className="nav-item">
    <div className="link-wrapper" {...(active ? {
      'aria-label': formatMessage({id: 'i18n:search-results:bar:current-page'}),
    } : {})}>
      <h4 className="search-results-link"
        dangerouslySetInnerHTML={{ __html: props.page.title }}
      />
    </div>
    <SearchResultHits
      activeSectionRef={props.activeSectionRef}
      book={props.book}
      hits={props.page.results}
      testId='search-result'
      getPage={() => props.page}
      onClick={selectResultAndFocus}
      selectedResult={props.selectedResult}
    />
  </li>;
};

const SearchResultsDropdown = (props: {
  currentPage: Page | undefined;
  currentQuery: string | null;
  chapter: SearchResultChapter;
  book: Book;
  selectResult: (payload: FirstArgumentType<typeof selectSearchResult>) => void;
  selectedResult: SelectedResult | null;
  activeSectionRef: React.RefObject<HTMLAnchorElement>;
}) => {
  return <li className="list-item">
    <BaseDetails className="details" open>
      <Summary className="search-bar-summary" tabIndex={0}>
        <div className="search-bar-summary-container" tabIndex={-1}>
          <ExpandIcon />
          <CollapseIcon />
          <h3 className="summary-title"
            dangerouslySetInnerHTML={{ __html: props.chapter.title }}
          />
        </div>
      </Summary>
      <ol className="details-ol">
        <SearchResultContainers
          currentPage={props.currentPage}
          currentQuery={props.currentQuery}
          containers={props.chapter.contents}
          book={props.book}
          selectResult={props.selectResult}
          selectedResult={props.selectedResult}
          activeSectionRef={props.activeSectionRef}
        />
      </ol>
    </BaseDetails>
  </li>;
};

export default connect(
  (state: AppState) => ({
    currentPage: select.page(state),
    currentQuery: selectSearch.query(state),
  }),
  (dispatch: Dispatch) => ({
    selectResult: () => {
      dispatch(closeSearchResultsMobile());
    },
  })
)(SearchResultContainers);
