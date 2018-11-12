import * as actions from './content/actions';
import { AppState, MiddlewareAPI } from './types';
import * as utils from './utils';

describe('checkActionType', () => {
  it('matches action matching creator', () => {
    const action = actions.openToc();
    expect(utils.checkActionType(actions.openToc)(action)).toBe(true);
  });

  it('doesn\'t match action not matching creator', () => {
    const action = actions.closeToc();
    expect(utils.checkActionType(actions.openToc)(action)).toBe(false);
  });
});

describe('actionHook', () => {
  it('binds state helpers', () => {
    const helperSpy = jest.fn();
    const helpers = {dispatch: () => undefined, getState: () => ({} as AppState)} as MiddlewareAPI;
    const middleware = utils.actionHook(actions.openToc, helperSpy);

    middleware(helpers);

    expect(helperSpy).toHaveBeenCalledWith(helpers);
  });

  it('hooks into requested action', () => {
    const hookSpy = jest.fn();
    const helpers = {dispatch: () => undefined, getState: () => ({} as AppState)} as MiddlewareAPI;
    const middleware = utils.actionHook(actions.openToc, () => hookSpy);

    middleware(helpers)((action) => action)(actions.openToc());

    expect(hookSpy).toHaveBeenCalled();
  });

  it('doens\'t hook into other actions', () => {
    const hookSpy = jest.fn();
    const helpers = {dispatch: () => undefined, getState: () => ({} as AppState)} as MiddlewareAPI;
    const middleware = utils.actionHook(actions.openToc, () => hookSpy);

    middleware(helpers)((action) => action)(actions.closeToc());

    expect(hookSpy).not.toHaveBeenCalled();
  });
});
