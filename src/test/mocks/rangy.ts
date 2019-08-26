import { RangyRange, TextRange } from 'rangy';

export const mockRange = (contents: string = '') => {
  const range = {
    findText: jest.fn(() => false),
    nativeRange: () => range,
    selectNodeContents: jest.fn(),
    toString: () => contents,
  };
  return range;
};

export default {
  createRange: jest.fn(() => mockRange()),
} as unknown as RangyRange & TextRange;
