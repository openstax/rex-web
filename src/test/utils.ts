import mockRangy from './mocks/rangy';

export const resetModules = () => {
  jest.resetModules();
  jest.mock('rangy', () => mockRangy);
  jest.mock('rangy/lib/rangy-textrange', () => ({}));
  jest.mock('ally.js/style/focus-within');
  jest.mock('mdn-polyfills/Node.prototype.children');
  jest.mock('mdn-polyfills/NodeList.prototype.forEach');
  jest.mock('details-element-polyfill', () => jest.fn());

  return {
    MessageProvider: require('../app/MessageProvider').default,
    Provider: require('react-redux').Provider,
    React: require('react'),
    ReactDOM: require('react-dom') as typeof import ('react-dom'),
    renderToDom: require('./reactutils').renderToDom,
    renderer: require('react-test-renderer'),
  };
};
