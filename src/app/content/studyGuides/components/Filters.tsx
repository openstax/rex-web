import flow from 'lodash/fp/flow';
import React from 'react';
import { connect } from 'react-redux';
import { AppState, Dispatch } from '../../../types';
import ChapterFilter from '../../elements/popUp/ChapterFilter';
import Filters, { FilterDropdown } from '../../elements/popUp/Filters';
import FiltersList from '../../elements/popUp/FiltersList';
import { setSummaryFilters } from '../actions';
import * as selectors from '../selectors';

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

export default () =>
  <Filters>
    <FilterDropdown
      label='i18n:highlighting:filters:chapters'
      ariaLabelId='i18n:studyguides:popup:filters:filter-by:aria-label'
    >
      <ConnectedChapterFilter />
    </FilterDropdown>
    <ConnectedFilterList />
  </Filters>;
