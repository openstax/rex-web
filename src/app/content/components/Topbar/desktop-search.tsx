import React from 'react';
import * as Styled from './styled';
import { mobileNudgeStudyToolsTargetId } from '../NudgeStudyTools/constants';
import { NudgeElementTarget } from '../NudgeStudyTools/styles';
import type { SearchArgs } from './search-common';
import { CloseButton } from './search-common';

type Args = React.PropsWithChildren<SearchArgs & { openMobileMenu(): void }>;

export default function DesktopSearch({
  state,
  onSearchSubmit,
  onSearchClear,
  onSearchChange,
  colorSchema,
  searchInSidebar,
  mobileToolbarOpen,
  newButtonEnabled,
  toggleMobile,
  openMobileMenu,
  children,
}: Args) {
  const openMenu = React.useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      openMobileMenu();
    },
    [openMobileMenu]
  );

  return (
    <Styled.SearchPrintWrapper>
      <NudgeElementTarget id={mobileNudgeStudyToolsTargetId}>
        <Styled.MenuButton type='button' onClick={openMenu} />
      </NudgeElementTarget>

      <Styled.SearchInputWrapper
        active={mobileToolbarOpen}
        onSubmit={onSearchSubmit}
        data-testid='desktop-search'
        data-experiment
        colorSchema={colorSchema}
        searchInSidebar={searchInSidebar}
      >
        <Styled.SearchInput
          desktop
          type='search'
          data-testid='desktop-search-input'
          onChange={onSearchChange}
          value={state.query}
        />
        <Styled.SearchButton
          mobile
          type='button'
          ariaLabelId='i18n:toolbar:search:toggle'
          data-analytics-label='Search this book'
          data-testid='mobile-toggle'
          data-experiment
          onClick={toggleMobile}
          colorSchema={colorSchema}
        />
        {state.formSubmitted && (
          <CloseButton
            desktop
            newButtonEnabled={newButtonEnabled}
            onSearchClear={onSearchClear}
            testid='desktop-clear-search'
          />
        )}
        <Styled.SearchButton
          desktop
          colorSchema={colorSchema}
          data-experiment
        />
      </Styled.SearchInputWrapper>
      {children}
    </Styled.SearchPrintWrapper>
  );
}
