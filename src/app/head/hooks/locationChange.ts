import { locationChange } from '../../navigation/actions';
import { ActionHookBody } from '../../types';
import { actionHook } from '../../utils';

export const hookBody: ActionHookBody<typeof locationChange> = () => () => {
  if (typeof(document) === 'undefined') {
    return;
  }

  const head = document.head;
  if (!head) {
    return;
  }

  head.querySelectorAll('meta[data-rex-page]').forEach((tag) => tag.remove());
};

export default actionHook(locationChange, hookBody);
