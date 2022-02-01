import { receiveFeatureFlags } from '../../../featureFlags/actions';
import { actionHook } from '../../../utils';
import loadPracticeQuestions, { loadPracticeQuestionsSummaryHookBody } from './locationChange';
import { setSelectedSectionHook } from './setSelectedSectionHook';

export {
  loadPracticeQuestions,
};

export default [
  setSelectedSectionHook,
  actionHook(receiveFeatureFlags, loadPracticeQuestionsSummaryHookBody),
];
