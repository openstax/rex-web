import { SerializedHighlight } from '@openstax/highlighter';
import { HTMLElement } from '@openstax/types/lib.dom';

export default (id: string = Math.random().toString(36).substring(7)) => {
  return {
    content: 'test highlight content',
    addFocusedStyles: jest.fn(),
    elements: [] as HTMLElement[],
    focus: jest.fn(),
    getStyle: jest.fn(),
    id,
    isAttached: jest.fn(() => true),
    range: {
      commonAncestorContainer: null as null | HTMLElement,
      getBoundingClientRect: jest.fn(() => ({ top: 0, bottom: 0 })),
    },
    serialize: () => ({
      data: {id} as SerializedHighlight['data'],
      getApiPayload: () => ({id} as ReturnType<SerializedHighlight['getApiPayload']>),
    }),
    setStyle: jest.fn(),
    sourceId: 'testbook1-testpage1-uuid',
  };
};
