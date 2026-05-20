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
import './SearchResultsSidebar.css';

const RelatedKeyTerms = ({ book, keyTermHits, selectedResult }: {
  book: Book, keyTermHits: SearchResultHit[], selectedResult: SelectedResult | null
}) => {
  const dispatch = useDispatch();

  return <div className="related-key-terms" data-analytics-region='kt-search-results'>
    <h3 className="search-results-section-title">
      <FormattedMessage id='i18n:search-results:related-key-term:title'>
        {(msg) => msg}
      </FormattedMessage>
    </h3>
    <SearchResultHits
      book={book}
      hits={keyTermHits}
      testId='related-key-term-result'
      getPage={(hit: SearchResultHit) => assertDefined(findArchiveTreeNodeById(book.tree, hit.source.pageId), 'hit has to be in a book')}
      onClick={() => {
        dispatch(closeSearchResultsMobile());
      }}
      selectedResult={selectedResult}
    />
  </div>;
};

export default RelatedKeyTerms;
