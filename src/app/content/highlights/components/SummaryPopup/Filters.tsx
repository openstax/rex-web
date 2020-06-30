import flow from 'lodash/fp/flow';
import React from 'react';
import { connect } from 'react-redux';
import { AppState, Dispatch } from '../../../../types';
import { assertWindow } from '../../../../utils';
import ChapterFilter from '../../../elements/popUp/ChapterFilter';
import Filters, { FilterDropdown } from '../../../elements/popUp/Filters';
import FiltersList from '../../../elements/popUp/FiltersList';
import PrintButton from '../../../elements/popUp/PrintButton';
import { printSummaryHighlights, setSummaryFilters } from '../../actions';
import * as select from '../../selectors';
import ColorFilter from './ColorFilter';

// tslint:disable-next-line:variable-name
export const ConnectedChapterFilter = connect(
  (state: AppState) => ({
    locationFilters: select.highlightLocationFilters(state),
    locationFiltersWithContent: select.highlightLocationFiltersWithContent(state),
    selectedLocationFilters: select.summaryLocationFilters(state),
  }),
  (dispatch: Dispatch) => ({
    setFilters: flow(setSummaryFilters, dispatch),
  })
)(ChapterFilter);

// tslint:disable-next-line:variable-name
export const ConnectedFilterList = connect(
  (state: AppState) => ({
    locationFilters: select.highlightLocationFilters(state),
    selectedColorFilters: select.summaryColorFilters(state),
    selectedLocationFilters: select.summaryLocationFilters(state),
  }),
  (dispatch: Dispatch) => ({
    setFilters: flow(setSummaryFilters, dispatch),
  })
)(FiltersList);

// tslint:disable-next-line:variable-name
export const ConnectedPrintButton = connect(
  (state: AppState) => ({
    disabled: select.summaryIsLoading(state),
    loading: select.summaryIsLoading(state),
    shouldFetchMore: select.hasMoreResults(state),
  }),
  (dispatch: Dispatch) => ({
    loadHighlightsAndPrint: flow(printSummaryHighlights, dispatch),
  }),
  (stateProps, dispatchProps) => {
    const {shouldFetchMore, loadHighlightsAndPrint, ...props} = {...stateProps, ...dispatchProps};
    return {
      ...props,
      onClick: () =>  shouldFetchMore ? loadHighlightsAndPrint() : assertWindow().print(),
    };
  }
)(PrintButton);

export default () =>
  <Filters>
    <FilterDropdown
      label='i18n:highlighting:filters:chapters'
      ariaLabelId='i18n:highlighting:filters:filter-by:aria-label'
    >
      <ConnectedChapterFilter />
    </FilterDropdown>
    <FilterDropdown
      label='i18n:highlighting:filters:colors'
      ariaLabelId='i18n:highlighting:filters:filter-by:aria-label'
    >
      <ColorFilter />
    </FilterDropdown>
    <ConnectedPrintButton data-testid='sg-print-button'/>
    <ConnectedFilterList />
  </Filters>;
