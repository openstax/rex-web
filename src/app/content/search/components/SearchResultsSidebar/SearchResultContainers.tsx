import { SearchResultHit } from '@openstax/open-search-client';
import React from 'react';
import { Details, ExpandIcon } from '../../../../components/Details';
import { CollapseIcon, SummaryTitle, SummaryWrapper } from '../../../components/Sidebar/styled';
import { Book, Page } from '../../../types';
import { stripIdVersion } from '../../../utils/idUtils';
import { isSearchResultChapter } from '../../guards';
import { SearchResultChapter, SearchResultContainer, SearchResultPage } from '../../types';
import * as Styled from './styled';
import { archiveTreeContainsNode } from '../../../utils/archiveTreeUtils';

// tslint:disable-next-line:variable-name
export const SearchResultContainers = (props: {
  currentPage: Page | undefined;
  containers: SearchResultContainer[];
  book: Book;
  closeSearchResults: () => void;
}) => (
  <React.Fragment>
    {props.containers.map((node: SearchResultContainer) =>
      isSearchResultChapter(node) ? (
        <SearchResultsDropdown
          currentPage={props.currentPage}
          chapter={node}
          book={props.book}
          closeSearchResults={props.closeSearchResults}
        />
      ) : (
        <SearchResult
          currentPage={props.currentPage}
          page={node}
          book={props.book}
          closeSearchResults={props.closeSearchResults}
        ></SearchResult>
      )
    )}
  </React.Fragment>
);

// tslint:disable-next-line:variable-name
const SearchResult = (props: {
  currentPage: Page | undefined;
  page: SearchResultPage;
  book: Book;
  closeSearchResults: () => void;
}) => {
  const active = props.page && props.currentPage
    && stripIdVersion(props.currentPage.id) === stripIdVersion(props.page.id);
  return <Styled.NavItem>
    <Styled.LinkWrapper {...(active ? {'aria-label': 'Current Page'} : {})}>
      <Styled.SearchResultsLink
        dangerouslySetInnerHTML={{ __html: props.page.title }}
      />
    </Styled.LinkWrapper>
    {props.page.results.map((hit: SearchResultHit) =>
      hit.source && hit.highlight && hit.highlight.visibleContent
        ? hit.highlight.visibleContent.map((highlight: string) => {
            return <Styled.SectionContentPreview
              book={props.book}
              page={props.page}
              onClick={() => {
                props.closeSearchResults();
              }}
              dangerouslySetInnerHTML={{ __html: highlight }}
            />;
          })
        : []
    )}
  </Styled.NavItem>;
};

// tslint:disable-next-line:variable-name
const SearchResultsDropdown = (props: {
  currentPage: Page | undefined;
  chapter: SearchResultChapter;
  book: Book;
  closeSearchResults: () => void;
}) => {

  const active = props.currentPage && props.chapter
    && archiveTreeContainsNode(props.chapter, props.currentPage.id);
  return <li>
    <Details {...(active ? {open: true} : {})}>
      <Styled.SearchBarSummary>
        <SummaryWrapper>
          <ExpandIcon />
          <CollapseIcon />
          <SummaryTitle
            dangerouslySetInnerHTML={{ __html: props.chapter.title }}
          />
        </SummaryWrapper>
      </Styled.SearchBarSummary>
      <Styled.DetailsOl>
        <SearchResultContainers
          currentPage={props.currentPage}
          containers={props.chapter.contents}
          book={props.book}
          closeSearchResults={props.closeSearchResults}
        />
      </Styled.DetailsOl>
    </Details>
  </li>;
};
