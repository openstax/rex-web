import { LinkedArchiveTreeNode, Page } from '../../types';
import {
  archiveTreeSectionIsChapter,
  findArchiveTreeNode,
} from '../../utils/archiveTreeUtils';
import { HighlightLocations } from '../types';

const getHighlightLocationForPage = (
  locations: HighlightLocations, page: Page | LinkedArchiveTreeNode | string
) => {
  const pageId = typeof page === 'string' ? page : page.id;
  let location = locations.get(pageId);

  if (!location) {
    for (const section of locations.values()) {
      if (archiveTreeSectionIsChapter(section) && findArchiveTreeNode(section, pageId)) {
        location = section;
        break;
      }
    }
  }

  return location;
};

export default getHighlightLocationForPage;
