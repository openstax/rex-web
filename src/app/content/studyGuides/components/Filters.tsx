import flow from 'lodash/fp/flow';
import React from 'react';
import { connect } from 'react-redux';
import { useAnalyticsEvent } from '../../../../helpers/analytics';
import { AppState, Dispatch } from '../../../types';
import ChapterFilter from '../../components/popUp/ChapterFilter';
import Filters, { FilterDropdown } from '../../components/popUp/Filters';
import FiltersList from '../../components/popUp/FiltersList';
import PrintButton from '../../components/popUp/PrintButton';
import { printStudyGuides, setSummaryFilters } from '../actions';
import * as selectors from '../selectors';
import { assertWindow } from '../../../utils';

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
  (stateProps, dispatchProps, ownProps: {onClick: () => void}) => {
    const {shouldFetchMore, loadHighlightsAndPrint, ...props} = {
      ...stateProps,
      ...dispatchProps,
      ...ownProps,
    };

    const onClick = () => {
      ownProps.onClick();

      if (shouldFetchMore) {
        loadHighlightsAndPrint();
      } else {
        assertWindow().print();
      }
    };

    return {...props, onClick};
  }
)(PrintButton);

export default () => {
  const trackPrint = useAnalyticsEvent('printStudyGuides');

  return <Filters>
    <FilterDropdown
      label='i18n:highlighting:filters:chapters'
      ariaLabelId='i18n:studyguides:popup:filters:filter-by:aria-label'
    >
      <ConnectedChapterFilter />
    </FilterDropdown>
    <ConnectedPrintButton onClick={trackPrint}/>
    <ConnectedFilterList />
  </Filters>;
};
