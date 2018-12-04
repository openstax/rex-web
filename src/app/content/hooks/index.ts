import { actionHook } from '../../utils';
import * as actions from '../actions';
import locationChange from './locationChange';
import receiveContent from './receiveContent';

export const receivePage = actionHook(actions.receivePage, receiveContent);
export const receiveBook = actionHook(actions.receiveBook, receiveContent);

export {
  locationChange
};
