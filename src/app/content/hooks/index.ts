import { routeHook } from '../../navigation/utils';
import { actionHook } from '../../utils';
import * as actions from '../actions';
import highlightHooks from '../highlights/hooks';
import placementsHooks from '../placements/hooks';
import practiceQuestionsHooks from '../practiceQuestions/hooks';
import * as routes from '../routes';
import searchHooks from '../search/hooks';
import studyGuidesHooks from '../studyGuides/hooks';
import locationChangeBody from './locationChange';
import receiveContentBody from './receiveContent';
import receivePageNotFoundId from './receivePageNotFoundId';

export default [
  ...searchHooks,
  ...highlightHooks,
  ...placementsHooks,
  ...studyGuidesHooks,
  ...practiceQuestionsHooks,
  receivePageNotFoundId,
  routeHook(routes.content, locationChangeBody),
  actionHook(actions.receivePage, receiveContentBody),
];
