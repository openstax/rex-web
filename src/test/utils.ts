import mockRangy from './mocks/rangy';

export const resetModules = () => {
  jest.resetModules();
  jest.mock('rangy', () => mockRangy);
  jest.mock('rangy/lib/rangy-textrange', () => ({}));
  jest.mock('ally.js/style/focus-within');
  jest.mock('details-element-polyfill', () => jest.fn());

  require('jest-styled-components');
};
