import { SearchResultHit } from '@openstax/open-search-client';
import isEqual from 'lodash/fp/isEqual';
import { OutputParams } from 'query-string';
import React from 'react';
import { connect } from 'react-redux';
import { useServices } from '../../../../context/Services';
import * as navSelect from '../../../../navigation/selectors';
import { AppState } from '../../../../types';
import { ArchiveTreeSection, Book } from '../../../types';
import { loadPageContent } from '../../../utils';
import { stripIdVersion } from '../../../utils/idUtils';
import { isKeyTermHit } from '../../guards';
import { SearchScrollTarget, SelectedResult } from '../../types';
import { getKeyTermPair } from '../../utils';
import RelatedKeyTermContent from './RelatedKeyTermContent';
import * as Styled from './styled';
import { stripHtml } from '../../../../utils';

interface SearchResultHitsProps {
  activeSectionRef?: React.RefObject<HTMLAnchorElement>;
  book: Book;
  hits: SearchResultHit[];
  testId: string;
  getPage: (hit: SearchResultHit) => ArchiveTreeSection;
  onClick: (result: { result: SearchResultHit; highlight: number }) => void;
  selectedResult: SelectedResult | null;
  queryParams: OutputParams;
}

type UseKeyTermPairProps = {
  hit: SearchResultHit;
  loader: Parameters<typeof loadPageContent>[0]
};
type OneSearchResultHitProps = Omit<SearchResultHitsProps, 'hits'> & UseKeyTermPairProps;

function useKeyTermPair({
  hit,
  loader,
}: UseKeyTermPairProps): ReturnType<typeof getKeyTermPair> | undefined {
  const [pair, setPair] = React.useState<ReturnType<typeof getKeyTermPair>>();

  React.useEffect(() => {
    const fn = async() => {
      const content = await loadPageContent(
        loader,
        stripIdVersion(hit.source.pageId)
      );

      setPair(getKeyTermPair(content, hit.source.elementId));
    };
    if (isKeyTermHit(hit)) {
      fn();
    }
  }, [hit, loader]);

  return pair;
}

function uniqueSearchLabel(
  index: number,
  title: string,
  highlight: string,
  isKeyTerm: boolean,
  keyTermName?: string
) {
  const extraText = `(Result ${index + 1} in ${stripHtml(title)})`;

  if (isKeyTerm && keyTermName) {
    return `${stripHtml(keyTermName)}: ${stripHtml(highlight)} ${extraText}`;
  }
  return `${stripHtml(highlight)} ${extraText}`;
}

const OneSearchResultHit = ({
  activeSectionRef,
  book,
  hit,
  getPage,
  testId,
  onClick,
  selectedResult,
  queryParams,
  loader,
}: OneSearchResultHitProps) => {
  const pair = useKeyTermPair({ hit, loader });
  const HighlightPreview = React.useCallback(
    (highlight: string, index: number) => {
      const thisResult = { result: hit, highlight: index };
      const isSelected = isEqual(selectedResult, thisResult);
      const target: SearchScrollTarget = {
        elementId: thisResult.result.source.elementId,
        index,
        type: 'search',
      };
      const page = getPage(hit);

      return (
        <Styled.SectionContentPreview
          selectedResult={isSelected}
          aria-current={isSelected}
          data-testid={testId}
          key={index}
          book={book}
          page={page}
          scrollTarget={target}
          queryParams={queryParams}
          onClick={() => onClick(thisResult)}
          aria-label={uniqueSearchLabel(index, page.title, highlight, isKeyTermHit(hit), pair?.term)}
          ref={isSelected ? activeSectionRef : undefined}
        >
          {isKeyTermHit(hit) ? (
            <RelatedKeyTermContent keyTermHit={hit} />
          ) : (
            <Styled.SimpleResult>
              <div
                tabIndex={-1}
                dangerouslySetInnerHTML={{ __html: highlight }}
              />
            </Styled.SimpleResult>
          )}
        </Styled.SectionContentPreview>
      );
    },
    [activeSectionRef, book, getPage, hit, onClick, queryParams, selectedResult, testId, pair?.term]
  );

  // inefficient data structure for search results should be addressed in the future
  // https://app.zenhub.com/workspaces/openstax-unified-5b71aabe3815ff014b102258/issues/openstax/unified/1750
  if (isKeyTermHit(hit)) {
    hit.highlight.term = '...';
    if (pair) {
      hit.highlight.term = pair.term;
      hit.highlight.visibleContent = [pair.definition];
    }
  }

  return (
    <React.Fragment>
      {hit.highlight.visibleContent?.map(HighlightPreview)}
    </React.Fragment>
  );
};

const SearchResultHits = ({
  activeSectionRef,
  book,
  hits,
  getPage,
  testId,
  onClick,
  selectedResult,
  queryParams,
}: SearchResultHitsProps) => {
  const { archiveLoader } = useServices();
  const loader = archiveLoader.forBook(book);

  return (
    <React.Fragment>
      {hits.map((hit, index) => (
        <OneSearchResultHit
          hit={hit}
          key={index}
          activeSectionRef={activeSectionRef}
          book={book}
          getPage={getPage}
          testId={testId}
          onClick={onClick}
          selectedResult={selectedResult}
          queryParams={queryParams}
          loader={loader}
        />
      ))}
    </React.Fragment>
  );
};

export const ConnectedSearchResultHits = connect((state: AppState) => ({
  queryParams: navSelect.persistentQueryParameters(state),
}))(SearchResultHits);

export default ConnectedSearchResultHits;
