import React from 'react';
import * as Styled from './styled';
import { FormattedMessage } from 'react-intl';
import type { SearchArgs } from './search-common';

type Args = React.PropsWithChildren<
  SearchArgs & { showBackToSearchResults: boolean }
>;

export default function MobileSearch({
  showBackToSearchResults,
  onSearchSubmit,
  onSearchClear,
  onSearchChange,
  colorSchema,
  searchInSidebar,
  mobileToolbarOpen,
  openSearchResults,
  toggleMobile,
  state,
  newButtonEnabled,
  children,
}: Args) {
  const openSearchbar = React.useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      openSearchResults();
    },
    [openSearchResults]
  );

  return (
    <Styled.MobileSearchWrapper mobileToolbarOpen={mobileToolbarOpen}>
      <Styled.Hr />
      <Styled.MobileSearchContainer>
        {showBackToSearchResults && (
          <FormattedMessage id='i18n:search-results:bar:toggle-text:mobile'>
            {(msg) => (
              <Styled.SeachResultsTextButton
                onClick={openSearchbar}
                data-testid='back-to-search-results'
              >
                <Styled.LeftArrow />
                <Styled.InnerText>{msg}</Styled.InnerText>
              </Styled.SeachResultsTextButton>
            )}
          </FormattedMessage>
        )}
        {!showBackToSearchResults && (
          <FormattedMessage id='i18n:search-results:bar:close-text:mobile'>
            {(msg) => (
              <Styled.CloseSearchResultsTextButton
                onClick={toggleMobile}
                data-testid='close-search-results'
              >
                <Styled.InnerText>{msg}</Styled.InnerText>
              </Styled.CloseSearchResultsTextButton>
            )}
          </FormattedMessage>
        )}
        <Styled.SearchInputWrapper
          action='#'
          onSubmit={onSearchSubmit}
          data-testid='mobile-search'
          data-experiment
          colorSchema={colorSchema}
          searchInSidebar={searchInSidebar}
        >
          <Styled.SearchInput
            mobile
            type='search'
            data-testid='mobile-search-input'
            autoFocus
            onChange={onSearchChange}
            value={state.query}
          />
          {!state.formSubmitted && !newButtonEnabled && (
            <Styled.SearchButton
              desktop
              colorSchema={colorSchema}
              data-experiment
            />
          )}
          {state.query && newButtonEnabled && (
            <Styled.CloseButtonNew
              type='button'
              onClick={onSearchClear}
              formSubmitted={state.formSubmitted}
              data-testid='mobile-clear-search'
            >
              <Styled.CloseIcon />
            </Styled.CloseButtonNew>
          )}
          {state.query && !newButtonEnabled && (
            <Styled.CloseButton
              type='button'
              onClick={onSearchClear}
              formSubmitted={state.formSubmitted}
              data-testid='mobile-clear-search'
            />
          )}
        </Styled.SearchInputWrapper>
        {children}
      </Styled.MobileSearchContainer>
    </Styled.MobileSearchWrapper>
  );
}
