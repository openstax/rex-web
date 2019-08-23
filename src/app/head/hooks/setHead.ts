import { ActionHookBody } from '../../types';
import { actionHook, assertDefined } from '../../utils';
import * as actions from '../actions';

export const hookBody: ActionHookBody<typeof actions.setHead> = () => ({payload: {title, meta}}) => {
  if (typeof(document) === 'undefined') {
    return;
  }

  document.title = title;

  const head = assertDefined(document.head, 'document must have a head');
  const body = assertDefined(document.body, 'document must have a body');

  meta = [...meta];
  const mainContent = body.querySelector('#main-content');
  if (mainContent) {
    const snippet = mainContent.innerHTML
      .replace(/<[^>]*>/g, ' ')
      .replace(/ +/g, ' ')
      .trim()
      .substring(0, 155)
      .trim();

    meta.push({property: 'og:description', content: snippet});
  }

  for (const metaValue of meta) {
    const tag = document.createElement('meta');
    tag.setAttribute('data-rex-page', '');
    Object.entries(metaValue).forEach(([name, value]) => tag.setAttribute(name, value));
    head.appendChild(tag);
  }
};

export default actionHook(actions.setHead, hookBody);
