import { routeHook } from '../../navigation/utils';
import { actionHook } from '../../utils';
import * as actions from '../actions';
import highlightHooks from '../highlights/hooks';
import * as routes from '../routes';
import searchHooks from '../search/hooks';
import locationChangeBody from './locationChange';
import receiveContentBody from './receiveContent';
import { closeCTAPopupHook, showCTAPopupHook } from './signupCTAHooks';

export default [
  ...searchHooks,
  ...highlightHooks,
  closeCTAPopupHook,
  showCTAPopupHook,
  routeHook(routes.content, locationChangeBody),
  actionHook(actions.receivePage, receiveContentBody),
];
