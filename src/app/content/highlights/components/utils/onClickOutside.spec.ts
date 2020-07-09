import { HTMLElement } from '@openstax/types/lib.dom';
import React from 'react';
import { assertDocument } from '../../../../utils';
import onClickOutside from './onClickOutside';

describe('onClickOutside', () => {
  const documentBack = assertDocument();
  const addEventListnerBackup = documentBack.addEventListener;
  const removeEventListnerBackup = documentBack.removeEventListener;
  let addEventListener: jest.SpyInstance;
  let removeEventListener: jest.SpyInstance;
  let ref: React.RefObject<HTMLElement>;

  beforeEach(() => {
    ref = React.createRef<HTMLElement>();
    addEventListener = jest.spyOn(assertDocument(), 'addEventListener');
    removeEventListener = jest.spyOn(assertDocument(), 'removeEventListener');
  });

  afterEach(() => {
    documentBack.addEventListener = addEventListnerBackup;
    documentBack.removeEventListener = removeEventListnerBackup;
  });

  it('registers event listener when focused', () => {
    onClickOutside(ref, true, () => null)();
    expect(addEventListener).toHaveBeenCalled();
  });

  it('doesn\'t register event listener when not focused', () => {
    onClickOutside(ref, false, () => null)();
    expect(addEventListener).not.toHaveBeenCalled();
  });

  it('removes event listener', () => {
    onClickOutside(ref, true, () => null)()();
    expect(removeEventListener).toHaveBeenCalled();
  });

  it('invoking event with some random target does nothing', () => {
    const cb = jest.fn();
    onClickOutside(ref, true, cb)();

    addEventListener.mock.calls[0][1]({
      target: 'asdf',
    });

    expect(cb).not.toHaveBeenCalled();
  });

  it('invoking event with target that is child of container does nothing', () => {
    const cb = jest.fn();
    const container = documentBack.createElement('div');
    const child = documentBack.createElement('div');
    container.appendChild(child);

    (ref as any).current = container;

    onClickOutside(ref, true, cb)();

    addEventListener.mock.calls[0][1]({
      target: child,
    });

    expect(cb).not.toHaveBeenCalled();
  });

  it('invoking event with target that is not child of container calls callback', () => {
    const cb = jest.fn();
    const container = documentBack.createElement('div');
    const notChild = documentBack.createElement('div');

    (ref as any).current = container;

    onClickOutside(ref, true, cb)();

    addEventListener.mock.calls[0][1]({
      target: notChild,
    });

    expect(cb).toHaveBeenCalled();
  });

  it('works for list of HTMLElemnets', () => {
    const cb = jest.fn();
    const container = documentBack.createElement('div');
    const container2 = documentBack.createElement('div');
    const child = documentBack.createElement('div');
    container2.appendChild(child);

    onClickOutside([container, container2], true, cb)();

    addEventListener.mock.calls[0][1]({
      target: child,
    });

    expect(cb).not.toHaveBeenCalled();
  });

  describe('outside browser', () => {
    beforeEach(() => {
      delete (global as any).document;
    });

    afterEach(() => {
      (global as any).document = documentBack;
    });

    it('doesn\'t register even when focused', () => {
      onClickOutside(ref, true, () => null)()();
      expect(addEventListener).not.toHaveBeenCalled();
    });
  });
});
