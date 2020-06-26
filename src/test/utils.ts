import mockRangy from './mocks/rangy';

export const resetModules = () => {
  jest.resetModules();
  jest.doMock('rangy', () => mockRangy);
  jest.doMock('rangy/lib/rangy-textrange', () => ({}));
  jest.doMock('focus-within-polyfill', () => ({}));
  jest.doMock('mdn-polyfills/Node.prototype.children', () => ({}));
  jest.doMock('mdn-polyfills/NodeList.prototype.forEach', () => ({}));
  jest.doMock('details-element-polyfill', () => jest.fn());
};

export const reactAndFriends = () => {
  return {
    MessageProvider: require('../app/MessageProvider').default,
    Provider: require('../app/content/elements/popUp/node_modules/react-redux').Provider,
    React: require('../app/content/elements/popUp/node_modules/react'),
    ReactDOM: require('react-dom') as typeof import ('react-dom'),
    renderToDom: require('./reactutils').renderToDom,
    renderer: require('../app/content/elements/popUp/node_modules/react-test-renderer'),
  };
};
