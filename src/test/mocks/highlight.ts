import { SerializedHighlight } from '@openstax/highlighter';
import { HTMLElement } from '@openstax/types/lib.dom';

export default (id: string = Math.random().toString(36).substring(7)) => {
  return {
    elements: [] as HTMLElement[],
    focus: jest.fn(),
    getStyle: jest.fn(),
    id,
    range: {
      commonAncestorContainer: null as null | HTMLElement,
      getBoundingClientRect: jest.fn(),
    },
    serialize: () => ({
      data: {id} as SerializedHighlight['data'],
      getApiPayload: () => ({id} as ReturnType<SerializedHighlight['getApiPayload']>),
    }),
    setStyle: jest.fn(),
  };
};
