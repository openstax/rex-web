import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import ChapterFilter from '../../components/popUp/ChapterFilter';
import Filters, { FilterDropdown, FiltersTopBar } from '../../components/popUp/Filters';
import { isLinkedArchiveTreeSection } from '../../guards';
import * as contentSelectors from '../../selectors';
import { findArchiveTreeNodeById } from '../../utils/archiveTreeUtils';
import { setSelectedSection } from '../actions';
import * as selectors from '../selectors';

export default () => {
  const [open, setOpen] = React.useState(false);
  const locationFilters = useSelector(selectors.practiceQuestionsLocationFilters);
  const selectedSection = useSelector(selectors.selectedSection);
  const book = useSelector(contentSelectors.book);
  const dispatch = useDispatch();
  const setFilters = React.useCallback(({ locationIds }: { locationIds: string[] }) => {
    const clickedSectionId = locationIds.pop();
    if (!clickedSectionId) {
      // user clicked on the selected section
      setOpen(false);
      return;
    }
    const search = book && locationIds.length
      ? findArchiveTreeNodeById(book.tree, clickedSectionId)
      : null;
    const section = search && isLinkedArchiveTreeSection(search) ? search : null;
    dispatch(setSelectedSection(section));
    setOpen(false);
  }, [book, dispatch]);
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
        <ChapterFilter
          locationFilters={locationFilters}
          selectedLocationFilters={selectedLocationFilters}
          setFilters={setFilters}
          multiselect={false}
        />
      </FilterDropdown>
    </FiltersTopBar>
  </Filters>;
};
