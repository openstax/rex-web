import { receiveFeatureFlags } from '../../../actions';
import { actionHook } from '../../../utils';
import loadPracticeQuestions, { loadPracticeQuestionSummaryHookBody } from './locationChange';
import { setSelectedSectionHook } from './setSelectedSectionHook';

export {
  loadPracticeQuestions,
};

export default [
  setSelectedSectionHook,
  actionHook(receiveFeatureFlags, loadPracticeQuestionSummaryHookBody),
];
