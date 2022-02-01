import { receiveFeatureFlags } from '../../../featureFlags/actions';
import { closeModal } from '../../../navigation/hooks/closeModalHook';
import { openModal } from '../../../navigation/hooks/openModalHook';
import { actionHook } from '../../../utils';
import { closeStudyGuides, openStudyGuides } from '../actions';
import { modalUrlName } from '../constants';
import {
  loadMoreHook,
  setDefaultSummaryFiltersHook,
  setSummaryFiltersHook,
  updateSummaryFiltersHook,
} from './loadMore';
import loadStudyGuides, { hookBody as loadStudyGuidesHookBody } from './locationChange';
import { openStudyGuidesHook } from './openStudyGuides';
import { printStudyGuidesHook } from './printStudyGuides';

export {
  loadStudyGuides,
};

export default [
  loadMoreHook,
  printStudyGuidesHook,
  openStudyGuidesHook,
  setSummaryFiltersHook,
  setDefaultSummaryFiltersHook,
  updateSummaryFiltersHook,
  actionHook(openStudyGuides, openModal(modalUrlName)),
  actionHook(closeStudyGuides, closeModal),
  actionHook(receiveFeatureFlags, loadStudyGuidesHookBody),
];
