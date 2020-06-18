import { loadMoreHook } from './loadMore';
import loadStudyGuides from './locationChange';
import { openStudyGuidesHook } from './openStudyGuides';

export {
  loadStudyGuides,
};

export default [
  loadMoreHook,
  openStudyGuidesHook,
];
