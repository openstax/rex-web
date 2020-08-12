import flow from 'lodash/fp/flow';
import React from 'react';
import { connect, useSelector } from 'react-redux';
import { loggedOut } from '../../../auth/selectors';
import { AppState, Dispatch } from '../../../types';
import ChapterFilter from '../../components/popUp/ChapterFilter';
import Filters, { FilterDropdown } from '../../components/popUp/Filters';
import FiltersList from '../../components/popUp/FiltersList';
import PrintButton from '../../components/popUp/PrintButton';
import { printStudyGuides, setSummaryFilters } from '../actions';
import * as selectors from '../selectors';
import ColorKey from './ColorKey';
import UsingThisGuideButton from './UsingThisGuide/UsingThisGuideButton';
import UsingThisGuideBanner from './UsingThisGuide/UsingThisGuideBanner';

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

// tslint:disable-next-line:variable-name
const ConnectedFilterList = connect(
  (state: AppState) => ({
    locationFilters: selectors.studyGuidesLocationFilters(state),
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
  const [UTGopen, setUTGopen] = React.useState(false);

  const toggleUsingThisGuide = () => {
    setUTGopen((state) => !state);
  };

  const closeUsingThisGuide = React.useCallback(() => { setUTGopen(false); }, []);

  return <React.Fragment>
    <Filters>
      <FilterDropdown
        label='i18n:highlighting:filters:chapters'
        ariaLabelId='i18n:studyguides:popup:filters:filter-by:aria-label'
      >
        <ConnectedChapterFilter disabled={userLoggedOut}/>
      </FilterDropdown>
      <ColorKey />
      <UsingThisGuideButton onClick={toggleUsingThisGuide} open={UTGopen}/>
      <ConnectedPrintButton studyGuidesButton />
      {!userLoggedOut && <ConnectedFilterList />}
    </Filters>
    {UTGopen && <UsingThisGuideBanner onClick={closeUsingThisGuide}/>}
  </React.Fragment>;
};
