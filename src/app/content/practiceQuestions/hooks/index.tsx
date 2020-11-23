import { closeModal } from '../../../navigation/hooks/closeModalHook';
import { openModal } from '../../../navigation/hooks/openModalHook';
import { actionHook } from '../../../utils';
import { closePracticeQuestions, openPracticeQuestions } from '../actions';
import { modalUrlName } from '../constants';
import loadPracticeQuestions from './locationChange';
import { openPracticeQuestionsHook } from './openPracticeQuestionsHook';
import { setSelectedSectionHook } from './setSelectedSectionHook';

export {
  loadPracticeQuestions,
};

export default [
  openPracticeQuestionsHook,
  setSelectedSectionHook,
  actionHook(closePracticeQuestions, closeModal),
  actionHook(openPracticeQuestions, openModal(modalUrlName)),
];
