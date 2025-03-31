import React from 'react';
import { useIntl } from 'react-intl';
import * as Styled from './styled';
import { SearchResultContainer } from '../../types';

export interface SearchResultStatusProps {
  query: string | null;
  results: SearchResultContainer[] | null;
  totalHits: number | null;
  totalHitsKeyTerms: number | null;
}

/**
 * Accesible messages for screen reader users.
 */
// tslint:disable-next-line: variable-name
export const SearchResultsStatus = ({
  query,
  results,
  totalHits,
  totalHitsKeyTerms,
}: SearchResultStatusProps) => {
  const messageProperties = {
    loadingState: {
      id: 'i18n:search-results:bar:loading-state',
      values: {},
    },
    noResultsState: {
      id: 'i18n:search-results:bar:query:no-results:notification',
      values: { value: query },
    },
    blankState: {
      id: 'i18n:search-results:bar:blank-state',
      values: {},
    },
    resultsState: {
      id: 'i18n:search-results:bar:query:results:notification',
      values: { search: totalHits, terms: totalHitsKeyTerms, value: query },
    },
  };

  const messageState = 
    results 
    ? results.length > 0 
      ? 'resultsState' 
      : 'noResultsState' 
    : query 
      ? 'loadingState' 
      : 'blankState';

  return (
    <Styled.HiddenMessageContainer aria-live='assertive'>
      {useIntl().formatMessage(
        { id: messageProperties[messageState].id },
        messageProperties[messageState].values
      )}
    </Styled.HiddenMessageContainer>
  );
};