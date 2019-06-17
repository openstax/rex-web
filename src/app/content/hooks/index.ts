import { routeHook } from '../../navigation/utils';
import { actionHook } from '../../utils';
import * as actions from '../actions';
import * as routes from '../routes';
import locationChangeBody from './locationChange';
import receiveContentBody from './receiveContent';

export { searchHook } from '../search/hooks';
export const locationChange = routeHook(routes.content, locationChangeBody);
export const receivePage = actionHook(actions.receivePage, receiveContentBody);
export const receiveBook = actionHook(actions.receiveBook, receiveContentBody);
