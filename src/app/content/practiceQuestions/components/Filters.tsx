import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import ChapterFilter from '../../components/popUp/ChapterFilter';
import Filters, { FilterDropdown, FiltersTopBar } from '../../components/popUp/Filters';
import * as contentSelectors from '../../selectors';
import { LinkedArchiveTreeSection } from '../../types';
import { findArchiveTreeNodeById } from '../../utils/archiveTreeUtils';
import { setSelectedSection } from '../actions';
import * as selectors from '../selectors';

export default () => {
  const [open, setOpen] = React.useState(false);
  const locationFilters = useSelector(selectors.practiceQuestionsLocationFilters);
  const selectedSection = useSelector(selectors.selectedSection);
  const book = useSelector(contentSelectors.book);
  const [isOpenChapterId, setIsOpenChapterId] = React.useState(selectedSection ? selectedSection.parent.id : null);
  const dispatch = useDispatch();
  const setFilters = React.useCallback(({ locationIds }: { locationIds: string[] }) => {
    const section = book && locationIds.length
      ? findArchiveTreeNodeById(book.tree, locationIds[0]) as LinkedArchiveTreeSection
      : null;
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
        setOpen={setOpen}
      >
        <ChapterFilter
          locationFilters={locationFilters}
          selectedLocationFilters={selectedLocationFilters}
          setFilters={setFilters}
          hideAllOrNone={true}
          isOpenChapterId={isOpenChapterId}
          onChapterToggleClick={(id: string) => setIsOpenChapterId((prev) => prev === id ? null : id)}
        />
      </FilterDropdown>
    </FiltersTopBar>
  </Filters>;
};
