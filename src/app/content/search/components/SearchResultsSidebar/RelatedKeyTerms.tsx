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

  return book && hits && hits.length > 0
    ? <React.Fragment>
      <Styled.RelatedKeyTerms>
        <Styled.SearchResultsSectionTitle>
          <FormattedMessage id='i18n:search-results:related-key-term:title'>
            {(msg) => msg}
          </FormattedMessage>
        </Styled.SearchResultsSectionTitle>
        {hits.map((hit, index) => {
          const thisResult = {result: hit, highlight: index};
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
      </Styled.RelatedKeyTerms>
      <Styled.SearchResultsSectionTitle>
        <FormattedMessage id='i18n:search-results:related-key-term:title'>
          {(msg) => msg}
        </FormattedMessage>
      </Styled.SearchResultsSectionTitle>
    </React.Fragment>
  : null;
};

export default RelatedKeyTerms;
