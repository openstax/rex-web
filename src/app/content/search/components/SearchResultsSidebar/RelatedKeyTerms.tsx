import { SearchResultHit } from '@openstax/open-search-client';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { useDispatch } from 'react-redux';
import { assertDefined } from '../../../../utils/assertions';
import { Book } from '../../../types';
import { findArchiveTreeNodeById } from '../../../utils/archiveTreeUtils';
import { closeSearchResultsMobile } from '../../actions';
import { SelectedResult } from '../../types';
import SearchResultHits from './SearchResultHits';
import * as Styled from './styled';

// tslint:disable-next-line: variable-name
const RelatedKeyTerms = ({ book, keyTermHits, selectedResult }: {
  book: Book, keyTermHits: SearchResultHit[], selectedResult: SelectedResult | null
}) => {
  const dispatch = useDispatch();

  return <Styled.RelatedKeyTerms data-analytics-region='kt-search-results'>
    <Styled.SearchResultsSectionTitle tabIndex='0'>
      <FormattedMessage id='i18n:search-results:related-key-term:title'>
        {(msg) => msg}
      </FormattedMessage>
    </Styled.SearchResultsSectionTitle>
    <SearchResultHits
      book={book}
      hits={keyTermHits}
      testId='related-key-term-result'
      getPage={(hit: SearchResultHit) => assertDefined(findArchiveTreeNodeById(book.tree, hit.source.pageId), 'hit has to be in a book')}
      onClick={() => {
        dispatch(closeSearchResultsMobile());
        // Timeout may not be necessary after #2221 is merged
        setTimeout(() => document?.querySelector('main')?.focus(), 20);
      }}
      selectedResult={selectedResult}
    />
  </Styled.RelatedKeyTerms>;
};

export default RelatedKeyTerms;
