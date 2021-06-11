import renderer from 'react-test-renderer';
import mockRangy from './mocks/rangy';

export const resetModules = async() => {
  jest.resetModules();
  jest.doMock('rangy', () => mockRangy);
  jest.doMock('rangy/lib/rangy-textrange', () => ({}));
  jest.doMock('focus-within-polyfill', () => ({}));
  jest.doMock('mdn-polyfills/Node.prototype.children', () => ({}));
  jest.doMock('mdn-polyfills/NodeList.prototype.forEach', () => ({}));
  jest.doMock('mdn-polyfills/Array.prototype.includes', () => ({}));
  jest.doMock('details-element-polyfill', () => jest.fn());
  const { disableArchiveTreeCaching } = await import('../app/content/utils/archiveTreeUtils');
  disableArchiveTreeCaching();
};

export const reactAndFriends = () => {
  return {
    MessageProvider: require('../app/messages/MessageProvider').default,
    Provider: require('react-redux').Provider,
    React: require('react'),
    ReactDOM: require('react-dom') as typeof import ('react-dom'),
    TestContainer: require('./TestContainer').default,
    renderToDom: require('./reactutils').renderToDom,
    renderer: require('react-test-renderer'),
  };
};

export const runHooks = () => {
  // tslint:disable-next-line: no-empty
  renderer.act(() => {});
};

export const runHooksAsync = async() => {
  // tslint:disable-next-line: no-empty
  await renderer.act(async() => {});
};
