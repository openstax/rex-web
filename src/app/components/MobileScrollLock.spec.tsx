import React, { ComponentClass } from 'react';
import { unmountComponentAtNode } from 'react-dom';
import { findRenderedComponentWithType } from 'react-dom/test-utils';
import { renderToDom } from '../../test/reactutils';
import MobileScrollLockWithClass, { MobileScrollLock } from './MobileScrollLock';

describe('Sidebar', () => {

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

});
