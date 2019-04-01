import { Document, Element, MediaQueryList } from '@openstax/types/lib.dom';
import ReactType, { ComponentClass } from 'react';
import { unmountComponentAtNode } from 'react-dom';
import { findRenderedComponentWithType } from 'react-dom/test-utils';
import rendererType from 'react-test-renderer';
import { renderToDom } from '../../test/reactutils';
import MobileScrollLockWithClass, { MobileScrollLock } from './MobileScrollLock';

describe('MobileScrollLock', () => {

  describe('in browser', () => {
    let React: typeof ReactType; // tslint:disable-line:variable-name
    beforeEach(() => {
      React = require('react');
    });

    it('applies and removes body class', () => {
      if (!document) {
        return expect(document).toBeTruthy();
      }

      const {root, tree} = renderToDom(<MobileScrollLockWithClass />);

      // reactDom types are a little broken, try removing these casts after updating @types/react and friends
      const component = findRenderedComponentWithType(tree, MobileScrollLock as unknown as ComponentClass);
      const bodyClass = (component.props as any).bodyClass;

      const bodyClasses = bodyClass.split(' ');
      const classList = document.body.classList;

      bodyClasses.forEach((expected: string) =>
        expect(classList.contains(expected)).toBe(true)
      );

      unmountComponentAtNode(root);

      bodyClasses.forEach((expected: string) =>
        expect(classList.contains(expected)).toBe(false)
      );
    });

    describe('when scrolling', () => {
      let scrollyElement: Element;
      let nonScrollyElement: Element;
      let doc: Document;
      let win: Window;

      const touchEvent = (target: Element) => {
        const event = doc.createEvent('TouchEvent');
        event.initEvent('touchmove', true, true);
        const spy = jest.spyOn(event, 'preventDefault');

        Object.defineProperty(event, 'target', {
          value: target,
          writable: false,
        });

        doc.dispatchEvent(event);

        return {event, spy};
      };

      beforeEach(() => {
        if (!document || !window) {
          throw new Error('jsdom...');
        }
        doc = document;
        win = window;

        scrollyElement = document.createElement('div');
        Object.defineProperty(scrollyElement, 'offsetHeight', {
          value: 1000,
          writable: false,
        });
        Object.defineProperty(scrollyElement, 'scrollHeight', {
          value: 5000,
          writable: false,
        });

        nonScrollyElement = document.createElement('div');
        Object.defineProperty(nonScrollyElement, 'offsetHeight', {
          value: 1000,
          writable: false,
        });
        Object.defineProperty(nonScrollyElement, 'scrollHeight', {
          value: 1000,
          writable: false,
        });

        renderToDom(<MobileScrollLockWithClass />);
      });

      describe('on mobile', () => {
        beforeEach(() => {
          win.matchMedia = () => ({matches: true}) as MediaQueryList;
        });

        it('prevents touchmove events when there is no scrollable parent (scrolling the window)', () => {
          const {spy} = touchEvent(nonScrollyElement);
          expect(spy).toHaveBeenCalled();
        });

        it('allows touchmove events when there is a scrollable parent (scrolling an element on page)', () => {
          const {spy} = touchEvent(scrollyElement);
          expect(spy).not.toHaveBeenCalled();
        });
      });

      describe('on desktop', () => {
        beforeEach(() => {
          win.matchMedia = () => ({matches: false}) as MediaQueryList;
        });

        it('allows touchmove events', () => {
          const {spy} = touchEvent(nonScrollyElement);
          expect(spy).not.toHaveBeenCalled();
        });
      });
    });
  });

  describe('outside the browser', () => {
    const windowBackup = window;
    const documentBackup = document;

    let renderer: typeof rendererType;
    let React: typeof ReactType; // tslint:disable-line:variable-name

    beforeEach(() => {
      jest.resetModules();
      delete (global as any).window;
      delete (global as any).document;
      React = require('react');
      renderer = require('react-test-renderer');
    });

    afterEach(() => {
      (global as any).window = windowBackup;
      (global as any).document = documentBackup;
    });

    it('mounts and unmounts without a dom', () => {
      const component = renderer.create(<MobileScrollLockWithClass />);
      expect(() => component.unmount()).not.toThrow();
    });
  });
});
