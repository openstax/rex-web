import { SerializedHighlight } from '@openstax/highlighter';
import { HTMLElement } from '@openstax/types/lib.dom';

export default () => {
  const id = Math.random().toString(36).substring(7);
  return {
    elements: [] as HTMLElement[],
    focus: jest.fn(),
    getStyle: jest.fn(),
    id,
    serialize: () => ({data: {id} as SerializedHighlight['data']}),
    setStyle: jest.fn(),
  };
};
