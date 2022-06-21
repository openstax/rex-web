import flow from 'lodash/fp/flow';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { isHtmlElement } from '../../../guards';
import { AppState, Dispatch } from '../../../types';
import { assertDocument } from '../../../utils';
import { openMobileMenu, setTextSize } from '../../actions';
import {
  clearSearch,
  openMobileToolbar,
  openSearchResultsMobile,
  requestSearch
} from '../../search/actions';
import * as selectSearch from '../../search/selectors';
import * as selectContent from '../../selectors';
import { textResizerDefaultValue, textResizerMaxValue, textResizerMinValue } from '../constants';
import { mobileNudgeStudyToolsTargetId } from '../NudgeStudyTools/constants';
import { NudgeElementTarget } from '../NudgeStudyTools/styles';
import * as Styled from './styled';
import { TextResizer } from './TextResizer';

interface Props {
  search: typeof requestSearch;
  query: string | null;
  clearSearch: () => void;
  openSearchResults: () => void;
  openMobileMenu: () => void;
  openMobileToolbar: () => void;
  mobileToolbarOpen: boolean;
  searchSidebarOpen: boolean;
  hasSearchResults: boolean;
  searchButtonColor: string | null;
  bookTheme: string;
  textSize: number | null;
  setTextSize: (size: number) => void;
}

interface State {
  query: string;
  queryProp: string;
  formSubmitted: boolean;
}

class Topbar extends React.Component<Props, State> {

  public static getDerivedStateFromProps(newProps: Props, state: State) {
    if (newProps.query && newProps.query !== state.queryProp && newProps.query !== state.query) {
      return { ...state, query: newProps.query, queryProp: newProps.query };
    }
    return { ...state, queryProp: newProps.query };
  }

  public state = { query: '', queryProp: '', formSubmitted: false };

  public render() {
    const openMenu = (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      this.props.openMobileMenu();
    };

    const onSearchSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      const activeElement = assertDocument().activeElement;
      if (this.state.query) {
        if (isHtmlElement(activeElement)) {
          activeElement.blur();
        }
        this.props.search(this.state.query);
        this.setState({ formSubmitted: true });
      }
    };

    const onSearchClear = (e: React.FormEvent) => {
      e.preventDefault();
      this.setState({ query: '', formSubmitted: false });
    };

    const toggleMobile = (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();

      if (this.props.mobileToolbarOpen) {
        this.props.clearSearch();
      } else {
        this.props.openMobileToolbar();
      }
    };

    const openSearchbar = (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      this.props.openSearchResults();
    };

    const onSearchChange = (e: React.FormEvent<HTMLInputElement>) => {
      this.setState({ query: (e.currentTarget as any).value, formSubmitted: false });
    };

    const onChangeTextSize = (e: React.FormEvent<HTMLInputElement>) => {
      const target = (e as any).currentTarget;
      const value = parseInt(target.value, 10);

      this.props.setTextSize(value);
    };

    const onDecreaseTextSize = (e: React.FormEvent<HTMLInputElement>) => {
      e.preventDefault();
      const newValue = (this.props.textSize || textResizerDefaultValue) - 1;
      if (newValue < textResizerMinValue) { return; }
      this.props.setTextSize(newValue);
    };

    const onIncreaseTextSize = (e: React.FormEvent<HTMLInputElement>) => {
      e.preventDefault();
      const newValue = (this.props.textSize || textResizerDefaultValue) + 1;
      if (newValue > textResizerMaxValue) { return; }
      this.props.setTextSize(newValue);
    };

    const showBackToSearchResults = !this.props.searchSidebarOpen && this.props.hasSearchResults;

    const newButtonEnabled = !!this.props.searchButtonColor;

    return <Styled.TopBarWrapper data-testid='topbar'>
      {/* mobileMedium is smaller (800px) than mobile (1200px) */}
      {/* Only hides on .mobile breakpoint, shows on desktop and .mobileMedium */}
      <Styled.SearchPrintWrapper>
        <NudgeElementTarget id={mobileNudgeStudyToolsTargetId}>
          <Styled.MenuButton type='button' onClick={openMenu} />
        </NudgeElementTarget>

        <Styled.SearchInputWrapper
          active={this.props.mobileToolbarOpen}
          onSubmit={onSearchSubmit}
          data-testid='desktop-search'
          data-experiment
          colorSchema={this.props.searchButtonColor}
        >
          <Styled.SearchInput desktop type='search' data-testid='desktop-search-input'
            onChange={onSearchChange}
            value={this.state.query} />
          <Styled.SearchButton mobile
            type='button'
            ariaLabelId='i18n:toolbar:search:toggle'
            data-analytics-label='Search this book'
            data-testid='mobile-toggle'
            data-experiment
            onClick={toggleMobile}
            colorSchema={this.props.searchButtonColor}
          />
          {!this.state.formSubmitted && !newButtonEnabled &&
            <Styled.SearchButton desktop colorSchema={this.props.searchButtonColor} data-experiment />
          }
          {this.state.formSubmitted && !newButtonEnabled &&
            <Styled.CloseButton desktop type='button' onClick={onSearchClear} data-testid='desktop-clear-search' />
          }
          {this.state.formSubmitted && newButtonEnabled &&
            <Styled.CloseButtonNew desktop type='button' onClick={onSearchClear} data-testid='desktop-clear-search'>
              <Styled.CloseIcon />
            </Styled.CloseButtonNew>
          }
          {newButtonEnabled &&
            <Styled.SearchButton desktop colorSchema={this.props.searchButtonColor} data-experiment />
          }
        </Styled.SearchInputWrapper>
        <TextResizer
          bookTheme={this.props.bookTheme}
          onChangeTextSize={onChangeTextSize}
          onDecreaseTextSize={onDecreaseTextSize}
          onIncreaseTextSize={onIncreaseTextSize}
          textSize={this.props.textSize}
          data-testid='text-resizer'
        />
      </Styled.SearchPrintWrapper>

      {/* Hides on desktop, shows on .mobile, sometimes on .mobileMedium IF mobileToolbarOpen is true */}
      <Styled.MobileSearchWrapper mobileToolbarOpen={this.props.mobileToolbarOpen}>
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
            colorSchema={this.props.searchButtonColor}
          >
            <Styled.SearchInput mobile type='search' data-testid='mobile-search-input'
              autoFocus
              onChange={onSearchChange} value={this.state.query} />
            {!this.state.formSubmitted && !newButtonEnabled &&
              <Styled.SearchButton desktop colorSchema={this.props.searchButtonColor} data-experiment />
            }
            {
              this.state.query && newButtonEnabled && <Styled.CloseButtonNew
                type='button'
                onClick={onSearchClear}
                formSubmitted={this.state.formSubmitted}
                data-testid='mobile-clear-search'
              >
                <Styled.CloseIcon />
              </Styled.CloseButtonNew>
            }
            {
              this.state.query && !newButtonEnabled && <Styled.CloseButton
                type='button'
                onClick={onSearchClear}
                formSubmitted={this.state.formSubmitted}
                data-testid='mobile-clear-search'
              />
            }
          </Styled.SearchInputWrapper>
          <TextResizer
            bookTheme={this.props.bookTheme}
            onChangeTextSize={onChangeTextSize}
            onDecreaseTextSize={onDecreaseTextSize}
            onIncreaseTextSize={onIncreaseTextSize}
            textSize={this.props.textSize}
            mobileToolbarOpen={this.props.mobileToolbarOpen}
            data-testid='mobile-text-resizer'
          />
        </Styled.MobileSearchContainer>
      </Styled.MobileSearchWrapper>
    </Styled.TopBarWrapper>;
  }
}

export default connect(
  (state: AppState) => ({
    bookTheme: selectContent.bookTheme(state),
    hasSearchResults: selectSearch.hasResults(state),
    mobileToolbarOpen: selectSearch.mobileToolbarOpen(state),
    query: selectSearch.query(state),
    searchButtonColor: selectSearch.searchButtonColor(state),
    searchSidebarOpen: selectSearch.searchResultsOpen(state),
    textSize: selectContent.textSize(state),
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
