import { receiveFeatureFlags } from '../../../actions';
import { actionHook } from '../../../utils';
import loadPracticeQuestions, { hookBody as loadPracticeQuestionsHookBody } from './locationChange';
import { setSelectedSectionHook } from './setSelectedSectionHook';

export {
  loadPracticeQuestions,
};

export default [
  setSelectedSectionHook,
  actionHook(receiveFeatureFlags, loadPracticeQuestionsHookBody),
];
