import { FocusEvent, HTMLElement } from '@openstax/types/lib.dom';
import { Store } from 'redux';
import scrollTo from 'scroll-to-element';
import createTestServices from '../test/createTestServices';
import createTestStore from '../test/createTestStore';
import { receivePageFocus } from './actions';
import * as domUtils from './domUtils';
import { onPageFocusChange } from './domUtils';
import { AppServices, MiddlewareAPI } from './types';
import { assertDocument, assertWindow } from './utils';

jest.mock('scroll-to-element');

beforeEach(() => {
  jest.resetAllMocks();
});

describe('scrollIntoView', () => {
  let element: HTMLElement;

  beforeEach(() => {
    element = assertDocument().createElement('div');
    assertDocument().body.appendChild(element);
  });

  afterEach(() => {
    element.remove();
  });

  it('scrolls up', () => {
    jest.spyOn(element, 'getBoundingClientRect').mockReturnValue({
      bottom: -40,
      top: -50,
    } as any);

    domUtils.scrollIntoView(element);

    expect(scrollTo).toHaveBeenCalledWith(element, expect.anything());
  });

  it('scrolls down', () => {
    jest.spyOn(element, 'getBoundingClientRect').mockReturnValue({
      bottom: assertWindow().innerHeight + 60,
      top: assertWindow().innerHeight + 50,
    } as any);

    domUtils.scrollIntoView(element);

    expect(scrollTo).toHaveBeenCalledWith(element, expect.anything());
  });

  it('noops', () => {
    jest.spyOn(element, 'getBoundingClientRect').mockReturnValue({
      bottom: 0,
      top: 0,
    } as any);

    domUtils.scrollIntoView(element);

    expect(scrollTo).not.toHaveBeenCalledWith(element, expect.anything());
  });

  it('noops if element was not found in the body', () => {
    element.remove();
    jest.spyOn(element, 'getBoundingClientRect').mockReturnValue({
      bottom: assertWindow().innerHeight + 60,
      top: assertWindow().innerHeight + 50,
    } as any);

    domUtils.scrollIntoView(element);

    expect(scrollTo).not.toHaveBeenCalledWith(element, expect.anything());
  });
});

describe('findFirstAncestorOrSelfOfType', () => {
  const document = assertDocument();
  const window = assertWindow();

  it('finds self', () => {
    const child = document.createElement('a');
    const parent = document.createElement('div');

    parent.appendChild(child);

    expect(domUtils.findFirstAncestorOrSelfOfType(child, window.HTMLAnchorElement)).toBe(child);
  });

  it('finds parent', () => {
    const child = document.createElement('span');
    const parent = document.createElement('a');

    parent.appendChild(child);

    expect(domUtils.findFirstAncestorOrSelfOfType(child, window.HTMLAnchorElement)).toBe(parent);
  });

  it('defaults to undefined', () => {
    const child = document.createElement('div');
    const parent = document.createElement('div');

    parent.appendChild(child);

    expect(domUtils.findFirstAncestorOrSelfOfType(child, window.HTMLAnchorElement)).toBeUndefined();
  });
});

describe('findElementSelfOrParent', () => {
  const document = assertDocument();

  it('returns self for elmeent', () => {
    const element = document.createElement('div');
    const result = domUtils.findElementSelfOrParent(element);
    expect(result).toBe(element);
  });

  it('returns parent for non-html element', () => {
    const parent = document.createElement('div');
    const element = document.createElementNS('http://www.w3.org/2000/svg', 'svg');

    parent.append(element);

    const result = domUtils.findElementSelfOrParent(element);
    expect(result).toBe(parent);
  });

  it('returns undefined if html element can\'t be found', () => {
    const element = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    const result = domUtils.findElementSelfOrParent(element);
    expect(result).toBeUndefined();
  });
});

describe('focus on tab change', () => {
  let store: Store;
  let services: AppServices & MiddlewareAPI;
  let pageFocus: jest.SpyInstance;
  let dispatch: jest.SpyInstance;

  beforeEach(() => {
    store = createTestStore();
    services = {
      ...createTestServices(),
      dispatch: store.dispatch,
      getState: store.getState,
    };
    pageFocus = jest.spyOn(services.analytics.pageFocus, 'track');
    dispatch = jest.spyOn(store, 'dispatch');
  });

  afterEach(() => {
    pageFocus.mockRestore();
  });

  it('reports focusin', async() => {
    onPageFocusChange(true, {services, store})();
    expect(dispatch).toHaveBeenCalledWith(receivePageFocus(true));
    expect(pageFocus).toHaveBeenCalledWith(expect.anything(), true);
  });

  it('reports focusout', () => {
    onPageFocusChange(false, {services, store})();
    expect(dispatch).toHaveBeenCalledWith(receivePageFocus(false));
    expect(pageFocus).toHaveBeenCalledWith(expect.anything(), false);
  });
});

describe('addSafeEventListener', () => {
  let element: HTMLElement;

  beforeEach(() => {
    element = assertDocument().createElement('div');
  });

  it('handles matching events', () => {
    const handler = jest.fn<void, [FocusEvent]>();
    let safeHandler: ((e: Event) => void) | undefined;

    jest.spyOn(element, 'addEventListener').mockImplementation((_, add: any) => safeHandler = add);

    domUtils.addSafeEventListener(element, 'focusout', handler);

    if (!safeHandler) {
      return expect(safeHandler).toBeTruthy();
    }

    const event = new (assertWindow().FocusEvent)('focusout');

    safeHandler(event);

    expect(handler).toHaveBeenCalledWith(event);
  });

  it('ignores not matching events', () => {
    const handler = jest.fn<void, [FocusEvent]>();
    let safeHandler: ((e: Event) => void) | undefined;

    jest.spyOn(element, 'addEventListener').mockImplementation((_, add: any) => safeHandler = add);

    domUtils.addSafeEventListener(element, 'focusout', handler);

    if (!safeHandler) {
      return expect(safeHandler).toBeTruthy();
    }

    const event = new (assertWindow().CustomEvent)('asdf');
    safeHandler(event);

    expect(handler).not.toHaveBeenCalled();
  });

  it('returns unbind', () => {
    const handler = jest.fn<void, [FocusEvent]>();
    let safeHandler: ((e: Event) => void) | undefined;

    jest.spyOn(element, 'addEventListener').mockImplementation((_, add: any) => safeHandler = add);
    const remove = jest.spyOn(element, 'removeEventListener');

    const unbind = domUtils.addSafeEventListener(element, 'focusout', handler);

    if (!safeHandler) {
      return expect(safeHandler).toBeTruthy();
    }

    unbind();

    expect(remove).toHaveBeenCalledWith('focusout', safeHandler);
  });
});

describe('elementIsVisibleInWindow', () => {
  let element: HTMLElement;
  const windowHeightBackup = window!.innerHeight;
  const windowWidthBackup = window!.innerWidth;
  const rect = {bottom: 40, right: 40, top: 10, left: 10};

  beforeEach(() => {
    element = document!.createElement('div');
    (window as any).innerHeight = 50;
    (window as any).innerWidth = 50;
    jest.spyOn(element, 'getBoundingClientRect').mockReturnValue(rect as DOMRect);
  });

  afterEach(() => {
    (window as any).innerHeight = windowHeightBackup;
    (window as any).innerWidth = windowWidthBackup;
  });

  it('returns true when contained', () => {
    expect(domUtils.elementIsVisibleInWindow(element)).toBe(true);
  });

  it('returns true when overflowing', () => {
    rect.bottom = 60;
    rect.right = 60;
    rect.left = -10;
    rect.top = -10;
    expect(domUtils.elementIsVisibleInWindow(element)).toBe(true);
  });

  it('returns false when above', () => {
    rect.bottom = -10;
    expect(domUtils.elementIsVisibleInWindow(element)).toBe(false);
  });

  it('returns false when below', () => {
    rect.top = 60;
    expect(domUtils.elementIsVisibleInWindow(element)).toBe(false);
  });

  describe('outside browser', () => {
    const windowBackup = window!;
    const documentBackup = document!;

    beforeEach(() => {
      delete (global as any).window;
      delete (global as any).document;
    });

    afterEach(() => {
      (global as any).window = windowBackup;
      (global as any).document = documentBackup;
    });

    it('returns false', () => {
      expect(domUtils.elementIsVisibleInWindow(element)).toBe(false);
    });
  });
});
