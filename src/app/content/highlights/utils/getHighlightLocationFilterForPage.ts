import { LinkedArchiveTreeNode, Page } from '../../types';
import {
  archiveTreeSectionIsChapter,
  findArchiveTreeNode,
} from '../../utils/archiveTreeUtils';
import { HighlightLocationFilters } from '../types';

const getHighlightLocationFilterForPage = (
  locationFilters: HighlightLocationFilters, page: Page | LinkedArchiveTreeNode | string
) => {
  const pageId = typeof page === 'string' ? page : page.id;
  let location = locationFilters.get(pageId);

  if (!location) {
    for (const section of locationFilters.values()) {
      if (archiveTreeSectionIsChapter(section) && findArchiveTreeNode(section, pageId)) {
        location = section;
        break;
      }
    }
  }

  return location;
};

export default getHighlightLocationFilterForPage;
