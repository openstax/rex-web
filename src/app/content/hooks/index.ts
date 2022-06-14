import { routeHook } from '../../navigation/utils';
import { actionHook } from '../../utils';
import * as actions from '../actions';
import highlightHooks from '../highlights/hooks';
import keyboardShortcutsHooks from '../keyboardShortcuts/hooks';
import practiceQuestionsHooks from '../practiceQuestions/hooks';
import * as routes from '../routes';
import searchHooks from '../search/hooks';
import studyGuidesHooks from '../studyGuides/hooks';
import kineticEnabled from './kineticEnabled';
import locationChangeBody from './locationChange';
import receiveContentBody from './receiveContent';
import receivePageNotFoundId from './receivePageNotFoundId';

export default [
  ...searchHooks,
  ...highlightHooks,
  ...keyboardShortcutsHooks,
  ...studyGuidesHooks,
  ...practiceQuestionsHooks,
  receivePageNotFoundId,
  routeHook(routes.content, locationChangeBody),
  routeHook(routes.createReading, locationChangeBody),
  actionHook(actions.receivePage, receiveContentBody),
  actionHook(actions.receivePage, kineticEnabled),
];
