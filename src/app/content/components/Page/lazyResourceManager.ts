import { Document } from '@openstax/types/lib.dom';

export const makeResourcesLazy = (document: Document) => {
  document.querySelectorAll('[src][width][height]').forEach((element) => {
    element.setAttribute('loading', 'lazy');
  });
};
