import { locationChange } from '../../navigation/actions';
import * as navigationActions from '../../navigation/actions';
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
import storeTextSize, { loadStoredTextSize } from './storeTextSize';

export default [
  ...searchHooks,
  ...highlightHooks,
  ...keyboardShortcutsHooks,
  ...studyGuidesHooks,
  ...practiceQuestionsHooks,
  receivePageNotFoundId,
  /*
   * clears meta on locationChange, in case the new route doesn't call setHead
   * */
  routeHook(routes.content, locationChangeBody),
  /*
   * sets metadata based on the loaded content
   */
  actionHook(actions.receivePage, receiveContentBody),
  /*
   * meta added by prerendering is removed after hydration calls the initial locationChange.
   * processing receiveContent on locationChange pops it back in again. in subsequent navigation
   * this noops because the book data has been cleared by the navigation.
   */
  actionHook(navigationActions.locationChange, receiveContentBody),
  actionHook(actions.receivePage, kineticEnabled),
  actionHook(actions.setTextSize, storeTextSize),
  actionHook(locationChange, loadStoredTextSize),
];
