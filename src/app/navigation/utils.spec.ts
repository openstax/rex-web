import { findRouteMatch } from './utils';

const routes = [
  {
    component: () => null,
    getUrl: () => 'url',
    name: 'basic test',
    paths: ['/basic'],
  },
  {
    component: () => null,
    getUrl: () => 'url',
    name: 'with params',
    paths: ['/with/:param'],
  },
];

describe('findRouteMatch', () => {
  it('returns undefined for no matching route', () => {
    const result = findRouteMatch(routes, '/wakawakawaka');
    expect(result).toEqual(undefined);
  });

  it('returns match for route without params', () => {
    const result = findRouteMatch(routes, '/basic');
    expect(result).toEqual({route: routes[0]});
  });

  it('returns match for route with params', () => {
    const result = findRouteMatch(routes, '/with/thing');
    expect(result).toEqual({route: routes[1], params: {param: 'thing'}});
  });
});
