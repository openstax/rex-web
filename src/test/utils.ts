import mockRangy from './mocks/rangy';

export const resetModules = () => {
  jest.resetModules();
  jest.mock('rangy', () => mockRangy);
  jest.mock('rangy/lib/rangy-textrange', () => ({}));
  jest.mock('focus-within-polyfill', () => ({}));
  jest.mock('details-element-polyfill', () => jest.fn());

  require('jest-styled-components');
};
