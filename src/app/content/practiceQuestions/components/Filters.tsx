import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import ChapterFilter from '../../components/popUp/ChapterFilter';
import Filters, { FilterDropdown, FiltersTopBar } from '../../components/popUp/Filters';
import { LinkedArchiveTreeSection } from '../../types';
import { setSelectedSection } from '../actions';
import * as selectors from '../selectors';

export default () => {
  const locationFilters = useSelector(selectors.practiceQuestionsLocationFilters);
  const selectedSection = useSelector(selectors.selectedSection);
  const dispatch = useDispatch();
  const setFilters = React.useCallback((section: LinkedArchiveTreeSection) => {
    dispatch(setSelectedSection(section));
  }, [dispatch]);

  return <Filters>
    <FiltersTopBar>
      <FilterDropdown
        label='i18n:practice-questions:popup:filters:chapters'
        ariaLabelId='i18n:practice-questions:popup:filters:filter-by:aria-label'
        closeWhenThisPropChange={selectedSection}
      >
        <ChapterFilter
          locationFilters={locationFilters}
          selectedSection={selectedSection}
          setFilters={setFilters}
        />
      </FilterDropdown>
    </FiltersTopBar>
  </Filters>;
};
