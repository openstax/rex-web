import { locationChange } from '../../navigation/actions';
import { ActionHookBody } from '../../types';
import { actionHook, assertDefined } from '../../utils';

if (typeof(document) !== 'undefined') {
  import(/* webpackChunkName: "nodelist-foreach-polyfill" */ 'nodelist-foreach-polyfill');
}

export const hookBody: ActionHookBody<typeof locationChange> = () => () => {
  if (typeof(document) === 'undefined') {
    return;
  }

  const head = assertDefined(document.head, 'document must have a head');

  head.querySelectorAll('meta[data-rex-page],link[data-rex-page]').forEach((tag) => tag.remove());
};

export default actionHook(locationChange, hookBody);
