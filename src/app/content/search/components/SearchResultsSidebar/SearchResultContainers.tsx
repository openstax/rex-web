import { SearchResultHit } from '@openstax/open-search-client';
import React from 'react';
import { Details, ExpandIcon } from '../../../../components/Details';
import { CollapseIcon, SummaryTitle, SummaryWrapper } from '../../../components/Sidebar/styled';
import { Book } from '../../../types';
import { isSearchResultChapter } from '../../guards';
import { SearchResultChapter, SearchResultContainer, SearchResultPage } from '../../types';
import * as Styled from './styled';

// tslint:disable-next-line:variable-name
export const SearchResultContainers = (props: {
  containers: SearchResultContainer[];
  book: Book;
  closeSearchResults: () => void;
}) => (
  <React.Fragment>
    {props.containers.map((node: SearchResultContainer) =>
      isSearchResultChapter(node) ? (
        <SearchResultsDropdown
          chapter={node}
          book={props.book}
          closeSearchResults={props.closeSearchResults}
        />
      ) : (
        <SearchResult
          page={node}
          book={props.book}
          closeSearchResults={props.closeSearchResults}
        />
      )
    )}
  </React.Fragment>
);

// tslint:disable-next-line:variable-name
const SearchResult = (props: {
  page: SearchResultPage;
  book: Book;
  closeSearchResults: () => void;
}) => (
  <Styled.NavItem>
    <Styled.LinkWrapper>
      <Styled.SearchResultsLink
        dangerouslySetInnerHTML={{ __html: props.page.title }}
      />
    </Styled.LinkWrapper>
    {props.page.results.map((hit: SearchResultHit) =>
      hit.source && hit.highlight && hit.highlight.visibleContent
        ? hit.highlight.visibleContent.map((highlight: string) => (
            <Styled.SectionContentPreview
              book={props.book}
              page={props.page}
              onClick={() => {
                props.closeSearchResults();
              }}
              dangerouslySetInnerHTML={{ __html: highlight }}
            />
          ))
        : []
    )}
  </Styled.NavItem>
);

// tslint:disable-next-line:variable-name
const SearchResultsDropdown = (props: {
  chapter: SearchResultChapter;
  book: Book;
  closeSearchResults: () => void;
}) => (
  <li>
    <Details>
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
          containers={props.chapter.contents}
          book={props.book}
          closeSearchResults={props.closeSearchResults}
        />
      </Styled.DetailsOl>
    </Details>
  </li>
);
