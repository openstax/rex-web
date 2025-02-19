import flow from 'lodash/fp/flow';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { isHtmlElement } from '../../../guards';
import { AppState, Dispatch } from '../../../types';
import { assertDocument } from '../../../utils';
import { openMobileMenu, setTextSize } from '../../actions';
import { TextResizerValue } from '../../constants';
import {
  clearSearch,
  openMobileToolbar,
  openSearchResultsMobile,
  requestSearch,
} from '../../search/actions';
import * as selectSearch from '../../search/selectors';
import * as selectContent from '../../selectors';
import { mobileNudgeStudyToolsTargetId } from '../NudgeStudyTools/constants';
import { NudgeElementTarget } from '../NudgeStudyTools/styles';
import * as Styled from './styled';
import { TextResizer } from './TextResizer';
import { useKeyCombination, useMatchMobileQuery } from '../../../reactUtils';
import { searchKeyCombination } from '../../highlights/constants';
import { HTMLElement, HTMLInputElement } from '@openstax/types/lib.dom';

interface Props {
  search: typeof requestSearch;
  query: string | null;
  clearSearch: () => void;
  openSearchResults: () => void;
  openMobileMenu: () => void;
  openMobileToolbar: () => void;
  mobileToolbarOpen: boolean;
  searchButtonColor: string | null;
  searchInSidebar: boolean;
  searchSidebarOpen: boolean;
  hasSearchResults: boolean;
  bookTheme: string;
  textSize: TextResizerValue | null;
  setTextSize: (size: TextResizerValue) => void;
  selectedResult: unknown;
}

type CommonSearchInputParams = Pick<
  Props,
  'mobileToolbarOpen' | 'searchButtonColor' | 'searchInSidebar'
> & {
  newButtonEnabled: boolean;
  onSearchChange: (e: React.FormEvent<HTMLInputElement>) => void;
  onSearchClear: (e: React.FormEvent) => void;
  onSearchSubmit: (e: React.FormEvent) => void;
  state: {
    query: string;
    formSubmitted: boolean;
  },
  toggleMobile: (e: React.MouseEvent<HTMLButtonElement>) => void;
};

function DesktopSearchInputWrapper({
  mobileToolbarOpen,
  newButtonEnabled,
  onSearchChange,
  onSearchClear,
  onSearchSubmit,
  searchButtonColor,
  searchInSidebar,
  state,
  toggleMobile,
}: CommonSearchInputParams) {
  return (
    <Styled.SearchInputWrapper
      active={mobileToolbarOpen}
      onSubmit={onSearchSubmit}
      data-testid='desktop-search'
      data-experiment
      colorSchema={searchButtonColor}
      searchInSidebar={searchInSidebar}
    >
      <Styled.SearchInput desktop type='search' data-testid='desktop-search-input'
        onChange={onSearchChange}
        value={state.query} />
      <Styled.SearchButton mobile
        type='button'
        ariaLabelId='i18n:toolbar:search:toggle'
        data-analytics-label='Search this book'
        data-testid='mobile-toggle'
        data-experiment
        onClick={toggleMobile}
        colorSchema={searchButtonColor}
      />
      {!state.formSubmitted && !newButtonEnabled &&
        <Styled.SearchButton desktop colorSchema={searchButtonColor} data-experiment />
      }
      {state.formSubmitted && !newButtonEnabled &&
        <Styled.CloseButton desktop
          type='button'
          aria-label='clear search'
          onClick={onSearchClear}
          data-testid='desktop-clear-search'
        />
      }
      {state.formSubmitted && newButtonEnabled &&
        <Styled.CloseButtonNew desktop
          type='button'
          aria-label='clear search'
          onClick={onSearchClear}
          data-testid='desktop-clear-search'
        >
          <Styled.CloseIcon />
        </Styled.CloseButtonNew>
      }
      {newButtonEnabled &&
        <Styled.SearchButton desktop colorSchema={searchButtonColor} data-experiment />
      }
    </Styled.SearchInputWrapper>
  );
}

function MobileSearchInputWrapper({
  mobileToolbarOpen,
  newButtonEnabled,
  onSearchChange,
  onSearchClear,
  onSearchSubmit,
  searchButtonColor,
  searchInSidebar,
  state,
  toggleMobile,
  openSearchResults,
  searchSidebarOpen,
  hasSearchResults,
  children,
} : React.PropsWithChildren<
  CommonSearchInputParams &
  Pick<
    Props,
    'openSearchResults' | 'searchSidebarOpen' | 'hasSearchResults'
  >
>) {
  const openSearchbar = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    openSearchResults();
  };
  const showBackToSearchResults = !searchSidebarOpen && hasSearchResults;

  return (
    <Styled.MobileSearchWrapper mobileToolbarOpen={mobileToolbarOpen}>
    <Styled.Hr />
    <Styled.MobileSearchContainer>
      {showBackToSearchResults &&
        <FormattedMessage id='i18n:search-results:bar:toggle-text:mobile'>
          {(msg) => <Styled.SeachResultsTextButton onClick={openSearchbar} data-testid='back-to-search-results'>
            <Styled.LeftArrow /><Styled.InnerText>{msg}</Styled.InnerText>
          </Styled.SeachResultsTextButton>}
        </FormattedMessage>}
      {!showBackToSearchResults &&
        <FormattedMessage id='i18n:search-results:bar:close-text:mobile'>
          {(msg) => <Styled.CloseSearchResultsTextButton onClick={toggleMobile} data-testid='close-search-results'>
            <Styled.InnerText>{msg}</Styled.InnerText>
          </Styled.CloseSearchResultsTextButton>}
        </FormattedMessage>}
      <Styled.SearchInputWrapper
        action='#'
        onSubmit={onSearchSubmit}
        data-testid='mobile-search'
        data-experiment
        colorSchema={searchButtonColor}
        searchInSidebar={searchInSidebar}
      >
        <Styled.SearchInput mobile type='search' data-testid='mobile-search-input'
          autoFocus
          onChange={onSearchChange} value={state.query} />
        {!state.formSubmitted && !newButtonEnabled &&
          <Styled.SearchButton desktop colorSchema={searchButtonColor} data-experiment />
        }
        {
          state.query && newButtonEnabled && <Styled.CloseButtonNew
            type='button'
            aria-label='clear search'
            onClick={onSearchClear}
            formSubmitted={state.formSubmitted}
            data-testid='mobile-clear-search'
          >
            <Styled.CloseIcon />
          </Styled.CloseButtonNew>
        }
        {
          state.query && !newButtonEnabled && <Styled.CloseButton
            type='button'
            aria-label='clear search'
            onClick={onSearchClear}
            formSubmitted={state.formSubmitted}
            data-testid='mobile-clear-search'
          />
        }
      </Styled.SearchInputWrapper>
      {children}
    </Styled.MobileSearchContainer>
  </Styled.MobileSearchWrapper>

  );
}

// Effectively a conditionally executed hook
function AltSCycler({hasSearchResults}: {hasSearchResults: boolean}) {
  const isMobile = useMatchMobileQuery();
  const cycleSearchRegions = React.useCallback(
    // Only in desktop layout
    () => {
      if (isMobile) {
        return;
      }
      const targets = [
        '[class*="SearchInputWrapper"] input',
        '[class*="SearchResultsBar"]',
        'main',
      ].map((q) => document?.querySelector<HTMLElement>(q));

      // Determine which region we are in (if any)
      const currentSectionIndex = targets.findIndex((el) =>
        document?.activeElement && el?.contains(document.activeElement)
      );

      // If not in any, go to search input
      if (currentSectionIndex < 0) {
        targets[0]?.focus();
        return;
      }
      // If there are no search results, toggle between search input and main content
      if (!hasSearchResults) {
        targets[currentSectionIndex === 0 ? 2 : 0]?.focus();
        return;
      }
      const nextSectionIndex = (currentSectionIndex + 1) % targets.length;

      targets[nextSectionIndex]?.focus();
      // Possibly we want to scroll the current result into view in results or content?
    },
    [isMobile, hasSearchResults]
  );

  useKeyCombination(searchKeyCombination, cycleSearchRegions);

  return null;
}

function Topbar(props: Props) {
  const openMenu = React.useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      props.openMobileMenu();
    },
    [props]
  );
  const newButtonEnabled = !!props.searchButtonColor;
  const prevQuery = React.useRef('');
  const [query, setQuery] = React.useState('');
  const [formSubmitted, setFormSubmitted] = React.useState(false);
  const state = React.useMemo(
    () => ({query, formSubmitted}),
    [query, formSubmitted]
  );

  if (props.query) {
    if (props.query !== query && props.query !== prevQuery.current) {
      setQuery(props.query);
    }
    prevQuery.current = props.query;
  }

  const onSearchChange = React.useCallback(
    ({currentTarget}: React.FormEvent<HTMLInputElement>) => {
      setQuery(currentTarget.value);
      setFormSubmitted(false);
    },
    []
  );
  const onSearchClear = React.useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      setQuery('');
      setFormSubmitted(false);
    },
    []
  );
  const onSearchSubmit = React.useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const activeElement = assertDocument().activeElement;
      if (query) {
        if (isHtmlElement(activeElement)) {
          activeElement.blur();
        }
        props.search(query);
        setFormSubmitted(true);
      }
    },
    [props, query]
  );
  const toggleMobile = React.useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();

      if (props.mobileToolbarOpen) {
        props.clearSearch();
      } else {
        props.openMobileToolbar();
      }
    },
    [props]
  );

  return (
    <Styled.TopBarWrapper data-testid='topbar'>
      {typeof window !== 'undefined' && <AltSCycler hasSearchResults={props.hasSearchResults} />}
      <Styled.SearchPrintWrapper>
        <NudgeElementTarget id={mobileNudgeStudyToolsTargetId}>
          <Styled.MenuButton type='button' onClick={openMenu} />
        </NudgeElementTarget>

        <DesktopSearchInputWrapper
          mobileToolbarOpen={props.mobileToolbarOpen}
          newButtonEnabled={newButtonEnabled}
          onSearchChange={onSearchChange}
          onSearchClear={onSearchClear}
          onSearchSubmit={onSearchSubmit}
          searchButtonColor={props.searchButtonColor}
          searchInSidebar={props.searchInSidebar}
          state={state}
          toggleMobile={toggleMobile}
        />
        <TextResizer
          bookTheme={props.bookTheme}
          textSize={props.textSize}
          setTextSize={props.setTextSize}
          data-testid='text-resizer'
        />
      </Styled.SearchPrintWrapper>

      <MobileSearchInputWrapper
          mobileToolbarOpen={props.mobileToolbarOpen}
          newButtonEnabled={newButtonEnabled}
          onSearchChange={onSearchChange}
          onSearchClear={onSearchClear}
          onSearchSubmit={onSearchSubmit}
          searchButtonColor={props.searchButtonColor}
          searchInSidebar={props.searchInSidebar}
          state={state}
          toggleMobile={toggleMobile}
          openSearchResults={props.openSearchResults}
          searchSidebarOpen={props.searchSidebarOpen}
          hasSearchResults={props.hasSearchResults}
        >
        <TextResizer
            bookTheme={props.bookTheme}
            textSize={props.textSize}
            setTextSize={props.setTextSize}
            mobileToolbarOpen={props.mobileToolbarOpen}
            data-testid='mobile-text-resizer'
          />
      </MobileSearchInputWrapper>
    </Styled.TopBarWrapper>
  );
}

export default connect(
  (state: AppState) => ({
    bookTheme: selectContent.bookTheme(state),
    hasSearchResults: selectSearch.hasResults(state),
    mobileToolbarOpen: selectSearch.mobileToolbarOpen(state),
    query: selectSearch.query(state),
    searchButtonColor: selectSearch.searchButtonColor(state),
    searchInSidebar: selectSearch.searchInSidebar(state),
    searchSidebarOpen: selectSearch.searchResultsOpen(state),
    textSize: selectContent.textSize(state),
    selectedResult: selectSearch.selectedResult(state),
  }),
  (dispatch: Dispatch) => ({
    clearSearch: flow(clearSearch, dispatch),
    openMobileMenu: flow(openMobileMenu, dispatch),
    openMobileToolbar: flow(openMobileToolbar, dispatch),
    openSearchResults: flow(openSearchResultsMobile, dispatch),
    search: flow(requestSearch, dispatch),
    setTextSize: flow(setTextSize, dispatch),
  })
)(Topbar);
