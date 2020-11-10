import flow from 'lodash/fp/flow';
import React from 'react';
import { connect } from 'react-redux';
import { AppState, Dispatch } from '../../../types';
import ChapterFilter from '../../components/popUp/ChapterFilter';
import Filters, { FilterDropdown, FiltersTopBar } from '../../components/popUp/Filters';
import { setSelectedSection } from '../actions';
import * as selectors from '../selectors';

// tslint:disable-next-line:variable-name
const ConnectedChapterFilter = connect(
  (state: AppState) => ({
    locationFilters: selectors.practiceQuestionsLocationFilters(state),
    selectedSection: selectors.selectedSection(state),
  }),
  (dispatch: Dispatch) => ({
    setFilters: flow(setSelectedSection, dispatch),
  })
)(ChapterFilter);

export default () => {
  return <Filters>
    <FiltersTopBar>
      <FilterDropdown
        label='i18n:highlighting:filters:chapters'
        ariaLabelId='i18n:studyguides:popup:filters:filter-by:aria-label'
      >
        <ConnectedChapterFilter />
      </FilterDropdown>
    </FiltersTopBar>
  </Filters>;
};
