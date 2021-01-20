import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components/macro';
import ChapterFilter from '../../components/popUp/ChapterFilter';
import Filters, { FilterDropdown, FiltersTopBar } from '../../components/popUp/Filters';
import { FiltersChange } from '../../components/popUp/types';
import { LinkedArchiveTreeSection } from '../../types';
import { setSelectedSection } from '../actions';
import * as selectors from '../selectors';

// tslint:disable-next-line: variable-name
const StyledChapterFilters = styled(ChapterFilter)`
  padding: 0;
`;

export default () => {
  const [open, setOpen] = React.useState(false);
  const locationFilters = useSelector(selectors.practiceQuestionsLocationFilters);
  const selectedSection = useSelector(selectors.selectedSection);
  const dispatch = useDispatch();
  const setFilters = React.useCallback((change: FiltersChange<LinkedArchiveTreeSection>) => {
    const clickedSection = change.new.pop();
    if (!clickedSection) {
      // user clicked on the selected section
      setOpen(false);
      return;
    }
    dispatch(setSelectedSection(clickedSection));
    setOpen(false);
  }, [dispatch]);
  const selectedLocationFilters = React.useMemo(
    () => new Set(selectedSection ? [selectedSection.id] : []),
    [selectedSection]);

  return <Filters>
    <FiltersTopBar>
      <FilterDropdown
        label='i18n:practice-questions:popup:filters:chapters'
        ariaLabelId='i18n:practice-questions:popup:filters:filter-by:aria-label'
        open={open}
        setOpen={(isOpen: boolean) => setOpen(isOpen)}
      >
        <StyledChapterFilters
          locationFilters={locationFilters}
          selectedLocationFilters={selectedLocationFilters}
          setFilters={setFilters}
          multiselect={false}
        />
      </FilterDropdown>
    </FiltersTopBar>
  </Filters>;
};
