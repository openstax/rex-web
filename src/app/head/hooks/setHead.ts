import { ActionHookBody } from '../../types';
import { actionHook, assertDefined } from '../../utils';
import * as actions from '../actions';

export const hookBody: ActionHookBody<typeof actions.setHead> = () => ({payload: {title, meta}}) => {
  if (typeof(document) === 'undefined') {
    return;
  }

  document.title = title;

  const head = assertDefined(document.head, 'document must have a head');

  const body = assertDefined(assertDefined(document.body, 'document must have a body').querySelector('#main-content'), 'must have a main content').innerHTML;
  const bodySnippet = body.replace(/<[^>]*>/g, ' ').trim().substring(0, 155);

  for (const metaValue of [...meta, {property: 'og:description', content: bodySnippet}]) {
    const tag = document.createElement('meta');
    tag.setAttribute('data-rex-page', '');
    Object.entries(metaValue).forEach(([name, value]) => tag.setAttribute(name, value));
    head.appendChild(tag);
  }
};

export default actionHook(actions.setHead, hookBody);
