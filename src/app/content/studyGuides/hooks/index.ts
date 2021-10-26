import { receiveFeatureFlags } from '../../../featureFlags/actions';
import { closeModal } from '../../../navigation/hooks/closeModalHook';
import { openModal } from '../../../navigation/hooks/openModalHook';
import { actionHook } from '../../../utils';
import * as actions from '../actions';
import { modalUrlName } from '../constants';
import {
  loadMoreHook,
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
  actionHook(actions.openStudyGuides, openModal(modalUrlName)),
  actionHook(actions.closeStudyGuides, closeModal),
  actionHook(receiveFeatureFlags, loadStudyGuidesHookBody),
];
