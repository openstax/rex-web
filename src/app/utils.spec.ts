import PromiseCollector from '../helpers/PromiseCollector';
import Sentry from '../helpers/Sentry';
import * as actions from './content/actions';
import { AppServices, AppState, MiddlewareAPI } from './types';
import * as utils from './utils';
import { assertDocument } from './utils';

jest.mock('../helpers/Sentry');

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

  it('catches and logs errors', () => {
    const hookSpy = jest.fn(() => { throw new Error(`an error`); });
    const helpers = ({
      dispatch: () => undefined,
      getState: () => ({} as AppState),
    } as any) as MiddlewareAPI & AppServices;
    const middleware = utils.actionHook(actions.openToc, () => hookSpy);
    middleware(helpers)(helpers)((action) => action)(actions.openToc());

    expect(Sentry.captureException).toHaveBeenCalled();
    expect(hookSpy).toHaveBeenCalled();
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

describe('assertDocumentElement', () => {
  it('returns value', () => {
    expect(utils.assertDocumentElement()).toBe(utils.assertDocument().documentElement);
    expect(utils.assertDocumentElement()).toBeTruthy();
  });

  describe('with a non-html document', () => {
    let mock: jest.SpyInstance;

    beforeEach(() => {
      mock = jest.spyOn(utils.assertDocument(), 'documentElement', 'get');
      mock.mockImplementation(() => {
        return null;
      });
    });

    afterEach(() => {
      if (mock) {
        mock.mockRestore();
      }
    });

    it('throws', () => {
      expect(() => utils.assertDocumentElement()).toThrowErrorMatchingInlineSnapshot(
        `"BUG: Document Element is null"`
      );
    });
  });
});

describe('mergeRefs', () => {
  it('merges refs', () => {
    const functionRef = jest.fn();
    const refObj = {current: undefined};
    const ref = 'foobar';

    utils.mergeRefs(functionRef, refObj)(ref);

    expect(refObj.current).toBe(ref);
    expect(functionRef).toHaveBeenCalledWith(ref);
  });
});

describe('remsToPx', () => {

  it('converts based on body font size', () => {
    assertDocument().body.style.fontSize = '14px';
    expect(utils.remsToPx(1)).toEqual(14);
  });

  describe('outside of browser', () => {
    const documentBack = document;
    const windowBack = window;

    beforeEach(() => {
      delete (global as any).document;
      delete (global as any).window;
    });

    afterEach(() => {
      (global as any).document = documentBack;
      (global as any).window = windowBack;
    });

    it('uses base rem size of 10', () => {
      expect(utils.remsToPx(1)).toEqual(10);
    });
  });
});

describe('getAllRegexMatches', () => {
  it('works with no matches', () => {
    const matcher = utils.getAllRegexMatches(/asdf/g);
    expect(matcher('qewr').length).toBe(0);
  });

  it('match with no groups', () => {
    const matcher = utils.getAllRegexMatches(/asdf/g);
    expect(matcher('asdf')[0][0]).toBe('asdf');
  });

  it('match with groups', () => {
    const matcher = utils.getAllRegexMatches(/(as)df/g);
    expect(matcher('asdf')[0][0]).toBe('asdf');
    expect(matcher('asdf')[0][1]).toBe('as');
  });

  it('match with multiple matches and groups', () => {
    const matcher = utils.getAllRegexMatches(/(as)df/g);
    expect(matcher('asdf asdf')[0][0]).toBe('asdf');
    expect(matcher('asdf asdf')[0][1]).toBe('as');
    expect(matcher('asdf asdf')[1][0]).toBe('asdf');
    expect(matcher('asdf asdf')[1][1]).toBe('as');
  });

  it('throws when global flag not passed' , () => {
    expect(() => utils.getAllRegexMatches(/asdf/)).toThrow();
  });
});

describe('merge', () => {
  it('merges things', () => {
    expect(utils.merge({asdf: 'asdf'}, {qwer: 'qwer'})).toEqual({asdf: 'asdf', qwer: 'qwer'});
  });

  it('maintains object references when possible', () => {
    const thing1 = {subobject: {}, asdf: 'asdf'};
    const thing2 = {qwer: 'qwer'};
    const merged = utils.merge(thing1, thing2);

    expect(thing1.subobject).toBe(merged.subobject);
  });

  it('doesn\'t modify refernces when merging', () => {
    const thing1 = {subobject: {qwer: 'qwer'}, asdf: 'asdf'};
    const thing2 = {subobject: {asdf: 'asdf'}};
    const merged = utils.merge(thing1, thing2);

    expect(thing1.subobject).not.toBe(merged.subobject);
    expect(merged).toEqual({
      asdf: 'asdf',
      subobject: {
        asdf: 'asdf',
        qwer: 'qwer',
      },
    });
  });

  it('last arg wins for non-plain objects', () => {
    const thing1 = {array: ['one'], asdf: 'asdf'};
    const thing2 = {array: ['two'], qwer: 'qwer'};
    const merged = utils.merge(thing1, thing2);

    expect(merged.array).toBe(thing2.array);
    expect(merged.array).toEqual(['two']);
  });
});

describe('preventDefault', () => {
  it('does it', () => {
    const event = {preventDefault: jest.fn()} as any;
    utils.preventDefault(event);
    expect(event.preventDefault).toHaveBeenCalled();
  });
});
