import { ActionHookBody } from '../../types';
import { actionHook, assertNotNull } from '../../utils';
import * as actions from '../actions';

export const hookBody: ActionHookBody<typeof actions.setHead> = () => ({
  payload: {title, meta, links, contentTags},
}) => {
  if (typeof(window) === 'undefined') {
    return;
  }

  window.document.title = title;

  const head = assertNotNull(window.document.head, 'document must have a head');

  for (const metaValue of meta) {
    const tag = window.document.createElement('meta');
    tag.setAttribute('data-rex-page', '');
    Object.entries(metaValue).forEach(([name, value]) => tag.setAttribute(name, value));
    head.appendChild(tag);
  }

  for (const linkValue of links) {
    const tag = window.document.createElement('link');
    tag.setAttribute('data-rex-page', '');
    Object.entries(linkValue).forEach(([name, value]) => tag.setAttribute(name, value));
    head.appendChild(tag);
  }

  window.dataLayer.push({contentTags});
};

export default actionHook(actions.setHead, hookBody);
