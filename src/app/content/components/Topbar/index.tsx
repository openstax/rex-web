import React from 'react';
import { FormattedMessage } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import { isHtmlElement } from '../../../guards';
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

// Props interface no longer needed with hooks pattern - state comes from useSelector

type CommonSearchInputParams = {
  mobileToolbarOpen: boolean;
  searchButtonColor: string | null;
  searchInSidebar: boolean;
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
  CommonSearchInputParams & {
    openSearchResults: () => void;
    searchSidebarOpen: boolean;
    hasSearchResults: boolean;
  }
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
        <Styled.SearchInput
          mobile
          autoFocus={mobileToolbarOpen}
          type='search'
          data-testid='mobile-search-input'
          onChange={onSearchChange}
          value={state.query}
        />
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

/**
 * Topbar Component
 *
 * Main navigation toolbar providing:
 * - Search functionality (desktop and mobile variants)
 * - Mobile menu button
 * - Text resizing controls
 * - Keyboard navigation (Alt+S for search focus cycling)
 *
 * Converted to modern hooks pattern (useSelector/useDispatch) from legacy connect() HOC.
 */
function Topbar() {
  // Redux state via hooks
  const dispatch = useDispatch();
  const bookTheme = useSelector(selectContent.bookTheme);
  const hasSearchResults = useSelector(selectSearch.hasResults);
  const mobileToolbarOpen = useSelector(selectSearch.mobileToolbarOpen);
  const reduxQuery = useSelector(selectSearch.query);
  const searchButtonColor = useSelector(selectSearch.searchButtonColor);
  const searchInSidebar = useSelector(selectSearch.searchInSidebar);
  const searchSidebarOpen = useSelector(selectSearch.searchResultsOpen);
  const textSize = useSelector(selectContent.textSize);

  // Local state for search input
  const prevQuery = React.useRef('');
  const [query, setQuery] = React.useState('');
  const [formSubmitted, setFormSubmitted] = React.useState(false);
  const state = React.useMemo(
    () => ({query, formSubmitted}),
    [query, formSubmitted]
  );

  // Sync local query with Redux query when it changes externally
  if (reduxQuery) {
    if (reduxQuery !== query && reduxQuery !== prevQuery.current) {
      setQuery(reduxQuery);
    }
    prevQuery.current = reduxQuery;
  }

  const newButtonEnabled = !!searchButtonColor;

  // Event handlers
  const openMenu = React.useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      dispatch(openMobileMenu());
    },
    [dispatch]
  );

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
      dispatch(clearSearch());
      setQuery('');
      setFormSubmitted(false);
    },
    [dispatch]
  );

  const onSearchSubmit = React.useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const activeElement = assertDocument().activeElement;
      if (query) {
        if (isHtmlElement(activeElement)) {
          activeElement.blur();
        }
        dispatch(requestSearch(query));
        setFormSubmitted(true);
      }
    },
    [dispatch, query]
  );

  const toggleMobile = React.useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();

      if (mobileToolbarOpen) {
        dispatch(clearSearch());
      } else {
        dispatch(openMobileToolbar());
      }
    },
    [dispatch, mobileToolbarOpen]
  );

  const handleOpenSearchResults = React.useCallback(() => {
    dispatch(openSearchResultsMobile());
  }, [dispatch]);

  const handleSetTextSize = React.useCallback((size: TextResizerValue) => {
    dispatch(setTextSize(size));
  }, [dispatch]);

  return (
    <Styled.TopBarWrapper data-testid='topbar'>
      {typeof window !== 'undefined' && <AltSCycler hasSearchResults={hasSearchResults} />}
      <Styled.SearchPrintWrapper>
        <NudgeElementTarget id={mobileNudgeStudyToolsTargetId}>
          <Styled.MenuButton type='button' onClick={openMenu} />
        </NudgeElementTarget>

        <DesktopSearchInputWrapper
          mobileToolbarOpen={mobileToolbarOpen}
          newButtonEnabled={newButtonEnabled}
          onSearchChange={onSearchChange}
          onSearchClear={onSearchClear}
          onSearchSubmit={onSearchSubmit}
          searchButtonColor={searchButtonColor}
          searchInSidebar={searchInSidebar}
          state={state}
          toggleMobile={toggleMobile}
        />
        <TextResizer
          bookTheme={bookTheme}
          textSize={textSize}
          setTextSize={handleSetTextSize}
          data-testid='text-resizer'
        />
      </Styled.SearchPrintWrapper>

      <MobileSearchInputWrapper
          mobileToolbarOpen={mobileToolbarOpen}
          newButtonEnabled={newButtonEnabled}
          onSearchChange={onSearchChange}
          onSearchClear={onSearchClear}
          onSearchSubmit={onSearchSubmit}
          searchButtonColor={searchButtonColor}
          searchInSidebar={searchInSidebar}
          state={state}
          toggleMobile={toggleMobile}
          openSearchResults={handleOpenSearchResults}
          searchSidebarOpen={searchSidebarOpen}
          hasSearchResults={hasSearchResults}
        >
        <TextResizer
            bookTheme={bookTheme}
            textSize={textSize}
            setTextSize={handleSetTextSize}
            mobileToolbarOpen={mobileToolbarOpen}
            data-testid='mobile-text-resizer'
          />
      </MobileSearchInputWrapper>
    </Styled.TopBarWrapper>
  );
}

export default Topbar;
