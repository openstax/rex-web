import React from 'react';
import { Provider } from 'react-redux';
import renderer from 'react-test-renderer';
import { createStore } from 'redux';
import NavigationProvider from './NavigationProvider';

const initialState = {
  hash: '',
  pathname: '',
  search: '',
  state: {},
};
const routes = [
  {
    component: () => <h1>route 1</h1>,
    getUrl: () => 'url',
    name: 'test1',
    paths: ['/test1'],
  },
  {
    component: () => <h1>route 2</h1>,
    getUrl: () => 'url',
    name: 'test2',
    paths: ['/test2'],
  },
];

describe('NavigationProvider', () => {
  it('renders the component for the matching route', () => {
    const rootState = {navigation: {
      ...initialState,
      pathname: '/test1',
    }} as RootState;

    const store = createStore(() => rootState, rootState);

    const heading = renderer
      .create(<Provider store={store}><NavigationProvider routes={routes} /></Provider>)
      .root
      .findByType('h1')
    ;

    expect(heading.children[0]).toEqual('route 1');
  });
  it('doesn\'t render any route component if none match', () => {
    const rootState = {navigation: {
      ...initialState,
      pathname: '/asdfasdfasdf',
    }} as RootState;

    const store = createStore(() => rootState, rootState);

    const navigation = renderer
      .create(<Provider store={store}><NavigationProvider routes={routes} /></Provider>)
      .root
      .findByType(NavigationProvider)
      .children[0]
    ;

    expect(navigation).not.toBeInstanceOf(String);

    if (typeof(navigation) !== 'string') {
      expect(navigation.children).toHaveLength(0);
    }

  });
});
