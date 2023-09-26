import React from 'react';
import * as Styled from './styled';
import { mobileNudgeStudyToolsTargetId } from '../NudgeStudyTools/constants';
import { NudgeElementTarget } from '../NudgeStudyTools/styles';
import type { SearchArgs } from './search-common';

type Args = React.PropsWithChildren<
  SearchArgs & { openMenu(e: React.MouseEvent<HTMLButtonElement>): void }
>;

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
  openMenu,
  children,
}: Args) {
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
        {!state.formSubmitted && !newButtonEnabled && (
          <Styled.SearchButton
            desktop
            colorSchema={colorSchema}
            data-experiment
          />
        )}
        {state.formSubmitted && !newButtonEnabled && (
          <Styled.CloseButton
            desktop
            type='button'
            onClick={onSearchClear}
            data-testid='desktop-clear-search'
          />
        )}
        {state.formSubmitted && newButtonEnabled && (
          <Styled.CloseButtonNew
            desktop
            type='button'
            onClick={onSearchClear}
            data-testid='desktop-clear-search'
          >
            <Styled.CloseIcon />
          </Styled.CloseButtonNew>
        )}
        {newButtonEnabled && (
          <Styled.SearchButton
            desktop
            colorSchema={colorSchema}
            data-experiment
          />
        )}
      </Styled.SearchInputWrapper>
      {children}
    </Styled.SearchPrintWrapper>
  );
}
