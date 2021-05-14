import { SearchResultHit } from '@openstax/open-search-client';
import { isEqual } from 'lodash/fp';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import { book as bookSelector } from '../../../selectors';
import { findArchiveTreeNodeById } from '../../../utils/archiveTreeUtils';
import { closeSearchResultsMobile } from '../../actions';
import { keyTermHits, selectedResult as selectedResultSelector } from '../../selectors';
import { SearchScrollTarget } from '../../types';
import * as Styled from './styled';

// tslint:disable-next-line: variable-name
const RelatedKeyTerms = () => {
  const dispatch = useDispatch();
  const hits = useSelector(keyTermHits);
  const selectedResult = useSelector(selectedResultSelector);
  const book = useSelector(bookSelector);
  console.log('hits', hits)
  console.log('selectedResult', selectedResult)

  const mockHits = [
    { source: { elementId: 'fs-id1171472152018', pageId: 'dd8eaea8-c24d-5499-8fca-2a6985125a69' }, highlight: { visibleContent: ['common goods', 'goods that all people may use but that are of limited supply'] } },
    { source: { elementId: 'fs-id1171474482696', pageId: 'dd8eaea8-c24d-5499-8fca-2a6985125a69' }, highlight: { visibleContent: ['democracy', 'a form of government where political power rests in the hands of the people'] } },
    { source: { elementId: 'fs-id1171472070779', pageId: 'dd8eaea8-c24d-5499-8fca-2a6985125a69' }, highlight: { visibleContent: ['direct democracy', 'a form of government where people participate directly in making government decisions instead of choosing representatives to do this for them'] } },
  ] as any as SearchResultHit[];

  return book && mockHits && mockHits.length > 0 ? <Styled.RelatedKeyTerms>
    <Styled.SearchResultsSectionTitle>
      <FormattedMessage id='i18n:search-results:related-key-term:title'>
        {(msg) => msg}
      </FormattedMessage>
    </Styled.SearchResultsSectionTitle>
    {mockHits.map((hit, index) => {
      const thisResult = {result: hit, highlight: index};
      console.log('thisResult', thisResult)
      const isSelected = isEqual(selectedResult, thisResult);
      const target: SearchScrollTarget = {
        elementId: thisResult.result.source.elementId,
        index,
        type: 'search',
      };
      const [term, description] = hit.highlight.visibleContent;
      const page = findArchiveTreeNodeById(book.tree, hit.source.pageId);

      return <Styled.SectionContentPreview
        selectedResult={isSelected}
        data-testid='related-key-term-result'
        key={index}
        book={book}
        page={page}
        result={thisResult}
        scrollTarget={target}
        onClick={() => dispatch(closeSearchResultsMobile())}
      >
        <Styled.KeyTermContainer>
          <Styled.KeyTerm>{term}</Styled.KeyTerm>
          {description}
        </Styled.KeyTermContainer>
      </Styled.SectionContentPreview>;
    })}
  </Styled.RelatedKeyTerms> : null;
};

export default RelatedKeyTerms;
