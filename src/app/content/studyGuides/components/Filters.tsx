import { HighlightColorEnum } from '@openstax/highlighter/dist/api';
import * as Cookies from 'js-cookie';
import flow from 'lodash/fp/flow';
import React from 'react';
import { connect, useSelector } from 'react-redux';
import styled from 'styled-components/macro';
import { loggedOut } from '../../../auth/selectors';
import { AppState, Dispatch } from '../../../types';
import ChapterFilter from '../../components/popUp/ChapterFilter';
import ColorFilter from '../../components/popUp/ColorFilter';
import Filters, { FilterDropdown, FiltersTopBar } from '../../components/popUp/Filters';
import FiltersList from '../../components/popUp/FiltersList';
import PrintButton from '../../components/popUp/PrintButton';
import { printStudyGuides, setSummaryFilters } from '../actions';
import { highlightStyles } from '../constants';
import * as selectors from '../selectors';
import UsingThisGuideButton from './UsingThisGuide/UsingThisGuideButton';
import UsingThisGuideBanner from './UsingThisGuide/UsingThisGuideBanner';
import { barHeight } from '../../styles/PopupConstants';
import { cookieUTG } from './UsingThisGuide/constants';

// tslint:disable-next-line:variable-name
const ConnectedChapterFilter = connect(
  (state: AppState) => ({
    locationFilters: selectors.studyGuidesLocationFilters(state),
    locationFiltersWithContent: selectors.studyGuidesLocationFiltersWithContent(state),
    selectedLocationFilters: selectors.summaryLocationFilters(state),
  }),
  (dispatch: Dispatch) => ({
    setFilters: flow(setSummaryFilters, dispatch),
  })
)(ChapterFilter);

// tslint:disable-next-line: variable-name
const StyledColorFilter = styled(ColorFilter)`
  min-width: 29rem;
`;

// tslint:disable-next-line: variable-name
const RightButtonsWrapper = styled.div`
  margin-left: auto;
  display: flex;
  align-items: center;
  height: ${barHeight}rem;
  overflow: visible;
`;

// tslint:disable-next-line: variable-name
const ConnectedColorFilter = connect(
  (state: AppState) => ({
    colorFiltersWithContent: selectors.highlightColorFiltersWithContent(state),
    selectedColorFilters: selectors.summaryColorFilters(state),
  }),
  (dispatch: Dispatch) => ({
    setSummaryFilters: flow(setSummaryFilters, dispatch),
  })
)(StyledColorFilter);

// tslint:disable-next-line:variable-name
const ConnectedFilterList = connect(
  (state: AppState) => ({
    locationFilters: selectors.studyGuidesLocationFilters(state),
    selectedColorFilters: selectors.summaryColorFilters(state),
    selectedLocationFilters: selectors.summaryLocationFilters(state),
  }),
  (dispatch: Dispatch) => ({
    setFilters: flow(setSummaryFilters, dispatch),
  })
)(FiltersList);

// tslint:disable-next-line:variable-name
const ConnectedPrintButton = connect(
  (state: AppState) => ({
    disabled: selectors.summaryIsLoading(state),
    loading: selectors.summaryIsLoading(state),
    shouldFetchMore: selectors.hasMoreResults(state),
  }),
  (dispatch: Dispatch) => ({
    loadHighlightsAndPrint: flow(printStudyGuides, dispatch),
  }),
  (stateProps, dispatchProps, ownProps) => {
    const {shouldFetchMore, loadHighlightsAndPrint, ...props} = {
      ...stateProps,
      ...dispatchProps,
      ...ownProps,
    };

    return shouldFetchMore
      ? {...props, onClick: loadHighlightsAndPrint}
      : props
    ;
  }
)(PrintButton);

export default () => {
  const userLoggedOut = useSelector(loggedOut);
  const showUTGInitially = React.useMemo(() => !Cookies.get(cookieUTG), []);
  const [UTGopen, setUTGopen] = React.useState(showUTGInitially);

  const toggleUsingThisGuide = () => {
    setUTGopen((state) => !state);
  };

  const closeUsingThisGuide = React.useCallback(() => { setUTGopen(false); }, []);

  return <Filters>
    <FiltersTopBar>
      <FilterDropdown
        label='i18n:highlighting:filters:chapters'
        ariaLabelId='i18n:studyguides:popup:filters:filter-by:aria-label'
      >
        <ConnectedChapterFilter disabled={userLoggedOut}/>
      </FilterDropdown>
      <FilterDropdown
        label='i18n:highlighting:filters:colors'
        ariaLabelId='i18n:studyguides:popup:filters:filter-by:aria-label'
      >
        <ConnectedColorFilter
          disabled={userLoggedOut}
          styles={highlightStyles}
          labelKey={(label: HighlightColorEnum) => `i18n:studyguides:popup:filters:${label}`}
        />
      </FilterDropdown>
      <RightButtonsWrapper tabIndex={-1}>
        <UsingThisGuideButton onClick={toggleUsingThisGuide} open={UTGopen} />
        <ConnectedPrintButton studyGuidesButton />
      </RightButtonsWrapper>
    </FiltersTopBar>
    <UsingThisGuideBanner
      onClick={closeUsingThisGuide}
      show={UTGopen}
      isOpenedForTheFirstTime={showUTGInitially}
    />
    {!userLoggedOut && <ConnectedFilterList
      colorAriaLabelKey={() => 'i18n:studyguides:popup:filters:remove:color'}
      colorLabelKey={(label: HighlightColorEnum) => `i18n:studyguides:popup:filters:${label}`}
    />}
  </Filters>;
};
