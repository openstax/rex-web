import { closeStudyGuidesHook } from './closeStudyGuides';
import { loadMoreHook, setDefaultSummaryFiltersHook, setSummaryFiltersHook } from './loadMore';
import { loadStudyGuides, syncModalWithUrlHook } from './locationChange';
import { openStudyGuidesHook } from './openStudyGuides';
import { printStudyGuidesHook } from './printStudyGuides';

export {
  loadStudyGuides,
};

export default [
  loadMoreHook,
  printStudyGuidesHook,
  openStudyGuidesHook,
  closeStudyGuidesHook,
  syncModalWithUrlHook,
  setSummaryFiltersHook,
  setDefaultSummaryFiltersHook,
];
