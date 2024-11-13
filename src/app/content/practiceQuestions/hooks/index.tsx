import { receiveFeatureFlags } from '../../../featureFlags/actions';
import { closeModal } from '../../../navigation/hooks/closeModalHook';
import { openModal } from '../../../navigation/hooks/openModalHook';
import { actionHook } from '../../../utils';
import { closePracticeQuestions, openPracticeQuestions } from '../actions';
import { modalUrlName } from '../constants';
import loadPracticeQuestions, { loadPracticeQuestionsSummaryHookBody } from './locationChange';
import { setSelectedSectionHook } from './setSelectedSectionHook';

export {
  loadPracticeQuestions,
};

export default [
  setSelectedSectionHook,
  actionHook(receiveFeatureFlags, loadPracticeQuestionsSummaryHookBody),
  actionHook(closePracticeQuestions, closeModal),
  actionHook(openPracticeQuestions, openModal(modalUrlName)),
];
