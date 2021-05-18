import { HTMLInputElement } from '@openstax/types/lib.dom';
import flow from 'lodash/fp/flow';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { featureFlagsEnabled as featureFlagsEnabledSelector } from '../../../featureFlags/selectors';
import { FeatureFlagVariantValue } from '../../../featureFlags/types';
import { isHtmlElement } from '../../../guards';
import { AppState, Dispatch } from '../../../types';
import { assertDocument } from '../../../utils';
import { practiceQuestionsEnabled as practiceQuestionsEnabledSelector } from '../../practiceQuestions/selectors';
import {
  clearSearch,
  openMobileToolbar,
  openSearchResultsMobile,
  requestSearch,
} from '../../search/actions';
import * as selectSearch from '../../search/selectors';
import { tocOpen } from '../../selectors';
import { nudgeStudyToolsTargetId } from '../NudgeStudyTools/constants';
import HighlightButton from './HighlightButton';
import PracticeQuestionsButton from './PracticeQuestionsButton';
import PrintButton from './PrintButton';
import StudyGuidesButton from './StudyGuidesButton';
import * as Styled from './styled';

interface Props {
  bookTheme: string;
  search: typeof requestSearch;
  query: string | null;
  clearSearch: () => void;
  openSearchResults: () => void;
  openMobileToolbar: () => void;
  mobileToolbarOpen: boolean;
  tocOpen: boolean | null;
  searchSidebarOpen: boolean;
  hasSearchResults: boolean;
  practiceQuestionsEnabled: boolean;
  searchButtonStyle: FeatureFlagVariantValue | null;
}

interface State {
  query: string;
  queryProp: string;
  formSubmitted: boolean;
}

class Toolbar extends React.Component<Props, State> {

  public static getDerivedStateFromProps(newProps: Props, state: State) {
    if (newProps.query && newProps.query !== state.queryProp && newProps.query !== state.query) {
      return {...state, query: newProps.query, queryProp: newProps.query};
    }
    return {...state, queryProp: newProps.query};
  }

  public state = { query: '', queryProp: '', formSubmitted: false };

  public render() {
    const onSubmit = (e: React.FormEvent) => {
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

    const onClear = (e: React.FormEvent) => {
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

    const onChange = (e: React.FormEvent<HTMLInputElement>) => {
      this.setState({ query: e.currentTarget.value, formSubmitted: false });
    };

    const showBackToSearchResults = !this.props.searchSidebarOpen && this.props.hasSearchResults;

    const hideFromFocus = this.props.tocOpen === true
      || (this.props.tocOpen === null && !this.props.searchSidebarOpen);

    const searchButtonColor = this.props.searchButtonStyle === 'grayButton' ? 'gray' : (
      this.props.searchButtonStyle === 'bannerColorButton' ? this.props.bookTheme : ''
    );

    return <Styled.BarWrapper data-analytics-region='toolbar'>
      <Styled.TopBar data-testid='toolbar'>
        <Styled.SearchPrintWrapper>
          <Styled.SearchInputWrapper
            active={this.props.mobileToolbarOpen}
            onSubmit={onSubmit}
            data-testid='desktop-search'
            colorSchema={searchButtonColor}
          >
            <Styled.SearchInput desktop type='search' data-testid='desktop-search-input'
              onChange={onChange}
              value={this.state.query}/>
            <Styled.SearchButton mobile
              type='button'
              ariaLabelId='i18n:toolbar:search:toggle'
              data-analytics-label='Search this book'
              data-testid='mobile-toggle'
              onClick={toggleMobile}
              colorSchema={searchButtonColor}
            />
            {!this.state.formSubmitted && <Styled.SearchButton desktop colorSchema={searchButtonColor} />}
            {this.state.formSubmitted &&
              <Styled.CloseButton desktop type='button' onClick={onClear} data-testid='desktop-clear-search' />
            }
          </Styled.SearchInputWrapper>
        </Styled.SearchPrintWrapper>
        <PracticeQuestionsButton />
        <Styled.NudgeElementTarget id={nudgeStudyToolsTargetId}>
          <StudyGuidesButton />
          <HighlightButton />
        </Styled.NudgeElementTarget>
        { !this.props.practiceQuestionsEnabled ? <PrintButton /> : null }
        <Styled.SidebarControl hideMobileText={true} tabIndex={hideFromFocus ? -1 : undefined} />
      </Styled.TopBar>
      {this.props.mobileToolbarOpen && <Styled.MobileSearchWrapper>
        <Styled.Hr />
        <Styled.MobileSearchContainer>
          {showBackToSearchResults &&
            <FormattedMessage id='i18n:search-results:bar:toggle-text:mobile'>
              {(msg) => <Styled.SeachResultsTextButton onClick={openSearchbar} data-testid='back-to-search-results'>
                <Styled.LeftArrow/><Styled.InnerText>{msg}</Styled.InnerText>
              </Styled.SeachResultsTextButton>}
            </FormattedMessage>}
          {!showBackToSearchResults &&
            <FormattedMessage id='i18n:search-results:bar:close-text:mobile'>
              {(msg) => <Styled.SeachResultsTextButton onClick={toggleMobile} data-testid='close-search-results'>
                <Styled.InnerText>{msg}</Styled.InnerText>
              </Styled.SeachResultsTextButton>}
            </FormattedMessage>}
          <Styled.SearchInputWrapper
            action='#'
            onSubmit={onSubmit}
            data-testid='mobile-search'
            colorSchema={searchButtonColor}
          >
            <Styled.SearchInput mobile type='search' data-testid='mobile-search-input'
              autoFocus
              onChange={onChange} value={this.state.query} />
            {this.state.query && <Styled.CloseButton
              type='button'
              onClick={onClear}
              data-testid='mobile-clear-search'
            />}
          </Styled.SearchInputWrapper>
        </Styled.MobileSearchContainer>
      </Styled.MobileSearchWrapper>}
    </Styled.BarWrapper>;
  }
}

export default connect(
  (state: AppState) => ({
    bookTheme: selectSearch.bookTheme(state),
    hasSearchResults: selectSearch.hasResults(state),
    mobileToolbarOpen: selectSearch.mobileToolbarOpen(state),
    practiceQuestionsEnabled: practiceQuestionsEnabledSelector(state),
    query: selectSearch.query(state),
    searchButtonStyle: featureFlagsEnabledSelector(state).searchButton,
    searchSidebarOpen: selectSearch.searchResultsOpen(state),
    tocOpen: tocOpen(state),
  }),
  (dispatch: Dispatch) => ({
    clearSearch: flow(clearSearch, dispatch),
    openMobileToolbar: flow(openMobileToolbar, dispatch),
    openSearchResults: flow(openSearchResultsMobile, dispatch),
    search: flow(requestSearch, dispatch),
  })
)(Toolbar);
