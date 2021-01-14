import { makeApplicationError } from '../helpers/applicationMessageError';
import PromiseCollector from '../helpers/PromiseCollector';
import Sentry from '../helpers/Sentry';
import createTestStore from '../test/createTestStore';
import { book } from '../test/mocks/archiveLoader';
import { mockCmsBook } from '../test/mocks/osWebLoader';
import * as actions from './content/actions';
import * as selectors from './content/selectors';
import { formatBookData } from './content/utils';
import { notFound } from './errors/routes';
import { addToast } from './notifications/actions';
import { AppServices, AppState, MiddlewareAPI, Store } from './types';
import * as utils from './utils';
import { assertDocument, UnauthenticatedError } from './utils';

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
    jest.resetAllMocks();
  });

  it('do not log error if it is instace of UnauthenticatedError', () => {
    const hookSpy = jest.fn(async() => Promise.reject(new UnauthenticatedError('asd')));
    const helpers = ({
      dispatch: () => undefined,
      getState: () => ({} as AppState),
      promiseCollector: new PromiseCollector(),
    } as any) as MiddlewareAPI & AppServices;
    const middleware = utils.actionHook(actions.openToc, () => hookSpy);
    middleware(helpers)(helpers)((action) => action)(actions.openToc());

    expect(Sentry.captureException).not.toHaveBeenCalled();
    expect(hookSpy).toHaveBeenCalled();
    jest.resetAllMocks();
  });

  it('handle error if it is instace of BookNotFoundError', async() => {
    const hookSpy = jest.fn(async() => Promise.reject(new utils.BookNotFoundError('asd')));
    const mockReplace = jest.fn();
    jest.spyOn(utils.assertWindow().location, 'replace')
      .mockImplementation(mockReplace);
    const helpers = ({
      dispatch: jest.fn(),
      getState: () => ({} as AppState),
      promiseCollector: new PromiseCollector(),
    } as any) as MiddlewareAPI & AppServices;
    const middleware = utils.actionHook(actions.openToc, () => hookSpy);
    middleware(helpers)(helpers)((action) => action)(actions.openToc());
    await Promise.resolve();

    expect(hookSpy).toHaveBeenCalled();
    expect(Sentry.captureException).toHaveBeenCalled();
    expect(mockReplace).toHaveBeenCalledWith(notFound.getFullUrl());
    expect(helpers.dispatch).not.toHaveBeenCalled();
    jest.resetAllMocks();
  });
});

it('handle error if it is instance of ApplicationMesssageError', async() => {
  const hookSpy = jest.fn(async() => Promise.reject(
    new (makeApplicationError('some-key'))({ destination: 'myHighlights', shouldAutoDismiss: true })
  ));
  const helpers = ({
    dispatch: jest.fn(),
    getState: () => ({} as AppState),
    promiseCollector: new PromiseCollector(),
  } as any) as MiddlewareAPI & AppServices;

  const dispatch = jest.spyOn(helpers, 'dispatch');
  jest.spyOn(global.Date, 'now').mockReturnValue(1);

  const middleware = utils.actionHook(actions.openToc, () => hookSpy);
  middleware(helpers)(helpers)((action) => action)(actions.openToc());
  await Promise.resolve();

  expect(Sentry.captureException).toHaveBeenCalled();
  expect(hookSpy).toHaveBeenCalled();
  expect(dispatch).toHaveBeenCalledWith(addToast('some-key', { destination: 'myHighlights', shouldAutoDismiss: true }));
  jest.resetAllMocks();
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

describe('assertNotNull', () => {
  it('returns value', () => {
    expect(utils.assertNotNull('foo', 'error')).toBe('foo');
  });

  it('throws on null', () => {
    expect(() =>
      utils.assertNotNull(null, 'error')
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
    assertDocument().documentElement!.style.fontSize = '14px';
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

describe('referringHostName', () => {
  const window = Object.create(null);

  describe('when rex is not embedded in an iframe', () => {
    beforeEach(() => {
      window.location = { href: 'foo'};
      window.parent = { location: window.location };
    });

    it('it returns the host name of not embedded', async() => {
      const hostName = utils.referringHostName(window);
      expect(hostName).toBe('not embedded');
    });
  });

  describe('when embedded you get the host name', () => {
    beforeEach(() => {
      window.document = { referrer: 'http://somewhereelse.com'};
      window.location = { href: 'foo'};
      window.parent = { location: {href: 'foox'} };
    });

    it('returns the correct hostname', async() => {
      const hostName = utils.referringHostName(window);
      expect(hostName).toBe('somewhereelse.com');
    });
  });

  describe('when host is unknown', () => {
    beforeEach(() => {
      window.document = { referrer: undefined };
      window.location = { href: 'foo'};
      window.parent = { location: {href: 'foox'} };
    });

    it('returns unknown', async() => {
      const hostName = utils.referringHostName(window);
      expect(hostName).toBe('unknown');
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

  it('merges arrays', () => {
    expect(utils.merge({asdf: [1]}, {asdf: [2]})).toEqual({asdf: [1, 2]});
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
    const thing1 = {asdf: 'asdf'};
    const thing2 = {asdf: 'qwer'};
    const merged = utils.merge(thing1, thing2);

    expect(merged.asdf).toBe(thing2.asdf);
    expect(merged.asdf).toEqual('qwer');
  });
});

describe('preventDefault', () => {
  it('does it', () => {
    const event = {preventDefault: jest.fn()} as any;
    utils.preventDefault(event);
    expect(event.preventDefault).toHaveBeenCalled();
  });
});

describe('shallowEqual', () => {
  describe('eveluates to true', () => {
    it('for the same object', () => {
      const obj = {};
      expect(utils.shallowEqual(obj, obj)).toBe(true);
    });

    it('for objects with primitive values', () => {
      const objA = {prop1: 1, prop2: 'string', prop3: null, prop4: false, prop5: undefined};
      const objB = {...objA};
      expect(utils.shallowEqual(objA, objB)).toBe(true);
    });

    it('for object with the same references as their properties', () => {
      const nested = {prop: 1};

      const objA = {propA: false, propB: nested};
      const objB = {propA: false, propB: nested};

      expect(utils.shallowEqual(objA, objB)).toBe(true);
    });

    it('for objects with properties in different order', () => {
      const objA = {propA: 1, propB: 'string'};
      const objB = {propB: 'string', propA: 1};

      expect(utils.shallowEqual(objA, objB)).toBe(true);
    });
  });

  describe('evaluates to false', () => {
    it('for objects with missing keys', () => {
      const objA = {propA: 1, propB: 'string'};
      const objB = {propA: 1};

      expect(utils.shallowEqual(objA, objB)).toBe(false);
      expect(utils.shallowEqual(objB, objA)).toBe(false);
    });

    it('for objects with different top level values', () => {
      const objA = {propA: 1, propB: 'string'};
      const objB = {propA: 1, propB: 'another string'};

      expect(utils.shallowEqual(objA, objB)).toBe(false);
    });

    it('for objects with different property references', () => {
      const objA = {propA: 1, propB: {}};
      const objB = {propA: 1, propB: {}};

      expect(utils.shallowEqual(objA, objB)).toBe(false);
    });
  });
});

describe('memoizeStateToProps', () => {
  const customStateToProps = (state: AppState) => ({
    book: selectors.book(state),
    page: selectors.page(state),
  });

  let store: Store;

  beforeEach(() => {
    store = createTestStore();
  });

  it('memoizes custom state mapping functions', () => {
    const memoized = utils.memoizeStateToProps(customStateToProps);

    const mapStateToPropsWithMemoization = (state: AppState) => ({
      bookAndPage: customStateToProps(state),
      memoizedBookAndPage: memoized(state),
      tocOpen: selectors.tocOpen(state),
    });

    const stateA = mapStateToPropsWithMemoization(store.getState());
    const stateB = mapStateToPropsWithMemoization(store.getState());

    expect(stateA.bookAndPage).not.toBe(stateB.bookAndPage);
    expect(stateA.memoizedBookAndPage).toBe(stateB.memoizedBookAndPage);
  });

  it('return new values after state changes', () => {
    const memoized = utils.memoizeStateToProps(customStateToProps);

    const mapStateToProps = (state: AppState) => ({
      bookAndPage: memoized(state),
    });
    const stateA = mapStateToProps(store.getState());

    store.dispatch(actions.receiveBook(formatBookData(book, mockCmsBook)));
    const stateB = mapStateToProps(store.getState());

    expect(stateA.bookAndPage).not.toBe(stateB.bookAndPage);
  });
});
