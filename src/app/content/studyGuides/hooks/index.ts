import { initializeMyHighlightsSummaryHook } from './initializeStudyGuides';
import { loadMoreHook } from './loadMore';
import loadStudyGuides from './locationChange';

export {
  loadStudyGuides,
};

export default [
  initializeMyHighlightsSummaryHook,
  loadMoreHook,
]
