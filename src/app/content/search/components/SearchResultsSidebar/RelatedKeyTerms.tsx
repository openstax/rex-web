import { SearchResultHit } from '@openstax/open-search-client';
import { isEqual } from 'lodash/fp';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import { Book } from '../../../types';
import { findArchiveTreeNodeById } from '../../../utils/archiveTreeUtils';
import { closeSearchResultsMobile } from '../../actions';
import { selectedResult as selectedResultSelector } from '../../selectors';
import { SearchScrollTarget } from '../../types';
import * as Styled from './styled';

// tslint:disable-next-line: variable-name
const RelatedKeyTerms = ({ book, keyTermHits }: { book: Book, keyTermHits: SearchResultHit[] }) => {
  const dispatch = useDispatch();
  const selectedResult = useSelector(selectedResultSelector);

  return <Styled.RelatedKeyTerms>
    <Styled.SearchResultsSectionTitle>
      <FormattedMessage id='i18n:search-results:related-key-term:title'>
        {(msg) => msg}
      </FormattedMessage>
    </Styled.SearchResultsSectionTitle>
    {keyTermHits.map((hit, index) => {
      const thisResult = {result: hit, highlight: index};
      const isSelected = isEqual(selectedResult, thisResult);
      const target: SearchScrollTarget = {
        elementId: thisResult.result.source.elementId,
        index,
        type: 'search',
      };
      const term = hit.highlight.title;
      const description = hit.highlight.visibleContent[0];
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
        <Styled.KeyTermContainer tabIndex={-1}>
          <Styled.KeyTerm>{term}</Styled.KeyTerm>
          <div dangerouslySetInnerHTML={{ __html: description }} />
        </Styled.KeyTermContainer>
      </Styled.SectionContentPreview>;
    })}
  </Styled.RelatedKeyTerms>;
};

export default RelatedKeyTerms;
