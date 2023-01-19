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
  requestSearch
} from '../../search/actions';
import * as selectSearch from '../../search/selectors';
import * as selectContent from '../../selectors';
import * as Styled from '../components/SearchResultsSidebar/styled'; // TODO: rename

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

export const SearchInput = (props: Props) => {
  const [formSubmitted, setFormSubmitted] = React.useState(false);

  const onSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const activeElement = assertDocument().activeElement;
    if (props.query) {
      if (isHtmlElement(activeElement)) {
        activeElement.blur();
      }
      props.search(props.query);
      setFormSubmitted(true);
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

  return <Styled.SearchInputWrapper
    action='#'
    onSubmit={onSearchSubmit}
    data-experiment
    colorSchema={this.props.searchButtonColor}
    searchInSidebar={this.props.searchInSidebar}
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
}
