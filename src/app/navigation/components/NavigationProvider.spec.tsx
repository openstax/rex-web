import React from 'react';
import { Provider } from '../../../helpers/redux-bridge';
import renderer from 'react-test-renderer';
import createTestStore from '../../../test/createTestStore';
import { State } from '../types';
import NavigationProvider from './NavigationProvider';

const initialState: State = {
  hash: '',
  pathname: '/',
  query: {},
  search: '',
  state: null,
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
    const store = createTestStore({navigation: {
      ...initialState,
      pathname: '/test1',
    }});

    const heading = renderer
      .create(<Provider store={store}><NavigationProvider routes={routes} /></Provider>)
      .root
      .findByType('h1')
    ;

    expect(heading.children[0]).toEqual('route 1');
  });

  it('doesn\'t render any route component if none match', () => {
    const store = createTestStore({navigation: {
      ...initialState,
      pathname: '/asdfasdfasdf',
    }});

    const headings = renderer
      .create(<Provider store={store}><NavigationProvider routes={routes} /></Provider>)
      .root
      .findAllByType('h1')
    ;

    expect(headings.length).toBe(0);
  });
});
