import { ActionHookBody } from '../../types';
import { actionHook } from '../../utils';
import * as actions from '../actions';

export const hookBody: ActionHookBody<typeof actions.setHead> = () => ({payload: {title}}) => {
  if (typeof(document) === 'undefined') {
    return;
  }

  document.title = title;
};

export default actionHook(actions.setHead, hookBody);
