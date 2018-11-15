import { Location } from 'history';
import { PromiseCollector } from '../../helpers/PromiseCollector';
import { AppState, MiddlewareAPI } from '../types';
import { locationChange } from './actions';
import { findRouteMatch, routeHook } from './utils';

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

describe('routeHook', () => {
  it('binds state helpers', () => {
    const helperSpy = jest.fn();
    const helpers = {dispatch: () => undefined, getState: () => ({} as AppState)} as MiddlewareAPI;
    const middleware = routeHook(routes[0], helperSpy);
    const collector = new PromiseCollector();

    middleware(collector)(helpers);

    expect(helperSpy).toHaveBeenCalledWith(helpers);
  });

  it('hooks into requested route', () => {
    const hookSpy = jest.fn();
    const helpers = {dispatch: () => undefined, getState: () => ({} as AppState)} as MiddlewareAPI;
    const middleware = routeHook(routes[0], () => hookSpy);
    const collector = new PromiseCollector();
    const payload = {
      location: {} as Location,
      match: {
        route: routes[0],
      },
    };

    middleware(collector)(helpers)((action) => action)(locationChange(payload));

    expect(hookSpy).toHaveBeenCalledWith(payload);
  });

  it('doens\'t hook into other routes', () => {
    const hookSpy = jest.fn();
    const helpers = {dispatch: () => undefined, getState: () => ({} as AppState)} as MiddlewareAPI;
    const middleware = routeHook(routes[0], () => hookSpy);
    const collector = new PromiseCollector();
    const payload = {
      location: {} as Location,
      match: {
        route: routes[1],
      },
    };

    middleware(collector)(helpers)((action) => action)(locationChange(payload));

    expect(hookSpy).not.toHaveBeenCalled();
  });
});
