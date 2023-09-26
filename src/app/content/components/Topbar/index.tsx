import flow from 'lodash/fp/flow';
import React from 'react';
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
import MobileSearch from './mobile-search';
import DesktopSearch from './desktop-search';
import * as Styled from './styled';
import type { SearchArgs } from './search-common';
import { TextResizer } from './TextResizer';

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
}

interface State {
  query: string;
  queryProp: string;
  formSubmitted: boolean;
}

class Topbar extends React.Component<Props, State> {
  public static getDerivedStateFromProps(newProps: Props, state: State) {
    if (
      newProps.query &&
      newProps.query !== state.queryProp &&
      newProps.query !== state.query
    ) {
      return { ...state, query: newProps.query, queryProp: newProps.query };
    }
    return { ...state, queryProp: newProps.query };
  }

  public state = { query: '', queryProp: '', formSubmitted: false };

  public render() {
    const commonSearchArgs = this.getSearchArgs();
    const showBackToSearchResults =
      !this.props.searchSidebarOpen && this.props.hasSearchResults;

    return (
      <Styled.TopBarWrapper data-testid='topbar'>
        <DesktopSearch
          {...commonSearchArgs}
          openMobileMenu={this.props.openMobileMenu}
        >
          <TextResizer
            bookTheme={this.props.bookTheme}
            textSize={this.props.textSize}
            setTextSize={this.props.setTextSize}
            data-testid='text-resizer'
          />
        </DesktopSearch>
        <MobileSearch
          {...commonSearchArgs}
          showBackToSearchResults={showBackToSearchResults}
        >
          <TextResizer
            bookTheme={this.props.bookTheme}
            textSize={this.props.textSize}
            setTextSize={this.props.setTextSize}
            mobileToolbarOpen={this.props.mobileToolbarOpen}
            data-testid='mobile-text-resizer'
          />
        </MobileSearch>
      </Styled.TopBarWrapper>
    );
  }

  private getSearchArgs(): SearchArgs {
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
    const onSearchChange = (e: React.FormEvent<HTMLInputElement>) => {
      this.setState({
        query: (e.currentTarget as any).value,
        formSubmitted: false,
      });
    };
    const toggleMobile = (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();

      if (this.props.mobileToolbarOpen) {
        this.props.clearSearch();
      } else {
        this.props.openMobileToolbar();
      }
    };

    return {
      onSearchSubmit,
      onSearchClear,
      onSearchChange,
      colorSchema: this.props.searchButtonColor,
      searchInSidebar: this.props.searchInSidebar,
      mobileToolbarOpen: this.props.mobileToolbarOpen,
      openSearchResults: this.props.openSearchResults,
      toggleMobile,
      state: this.state,
      newButtonEnabled: !!this.props.searchButtonColor,
    };
  }
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
