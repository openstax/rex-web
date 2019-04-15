import PromiseCollector from '../helpers/PromiseCollector';
import * as actions from './content/actions';
import { AppServices, AppState, MiddlewareAPI } from './types';
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
    const helpers = ({
      dispatch: () => undefined,
      getState: () => ({} as AppState),
    } as any) as MiddlewareAPI & AppServices;
    const middleware = utils.actionHook(actions.openToc, helperSpy);

    middleware(helpers)(helpers);

    expect(helperSpy).toHaveBeenCalledWith(helpers);
  });

  it('hooks into requested action', () => {
    const hookSpy = jest.fn();
    const helpers = ({
      dispatch: () => undefined,
      getState: () => ({} as AppState),
    } as any) as MiddlewareAPI & AppServices;
    const middleware = utils.actionHook(actions.openToc, () => hookSpy);

    middleware(helpers)(helpers)((action) => action)(actions.openToc());

    expect(hookSpy).toHaveBeenCalled();
  });

  it('doens\'t hook into other actions', () => {
    const hookSpy = jest.fn();
    const helpers = ({
      dispatch: () => undefined,
      getState: () => ({} as AppState),
    } as any) as MiddlewareAPI & AppServices;
    const middleware = utils.actionHook(actions.openToc, () => hookSpy);

    middleware(helpers)(helpers)((action) => action)(actions.closeToc());

    expect(hookSpy).not.toHaveBeenCalled();
  });

  it('adds promise to collector', () => {
    const helpers = ({
      dispatch: () => undefined,
      getState: () => ({} as AppState),
      promiseCollector: new PromiseCollector(),
    } as any) as MiddlewareAPI & AppServices;

    const middleware = utils.actionHook(actions.openToc, () => () =>
      Promise.resolve()
    );

    middleware(helpers)(helpers)((action) => action)(actions.openToc());

    expect(helpers.promiseCollector.promises.length).toBe(1);
  });
});

describe('assertDefined', () => {
  it('returns value', () => {
    expect(utils.assertDefined('foo', 'error')).toBe('foo');
  });

  it('throws on undefined', () => {
    expect(() =>
      utils.assertDefined(undefined, 'error')
    ).toThrowErrorMatchingInlineSnapshot(`"error"`);
  });
});

describe('assertString', () => {
  it('returns value', () => {
    expect(utils.assertString('foo', 'error')).toBe('foo');
  });

  it('throws when not a string', () => {
    expect(() =>
      utils.assertString(123, 'error')
    ).toThrowErrorMatchingInlineSnapshot(`"error"`);
  });
});

describe('assertDocument', () => {
  it('returns value', () => {
    expect(utils.assertDocument()).toBe(document);
    expect(utils.assertDocument()).toBeTruthy();
  });

  describe('outside the browser', () => {
    const documentBackup = document;

    beforeEach(() => {
      delete (global as any).document;
    });

    afterEach(() => {
      (global as any).document = documentBackup;
    });

    it('throws', () => {
      expect(() => utils.assertDocument()).toThrowErrorMatchingInlineSnapshot(
        `"BUG: Document is undefined"`
      );
    });
  });
});
