import { book as archiveBook } from '../../../test/mocks/archiveLoader';
import type rendererType from 'react-test-renderer';
import type { ComponentType } from 'react';
import { mockCmsBook } from '../../../test/mocks/osWebLoader';
import { reactAndFriends, resetModules } from '../../../test/utils';
import { formatBookData } from '../utils';


const dummyBook = {
  ...formatBookData(archiveBook, mockCmsBook),
  content_warning_text: 'some warning text',
};

describe('ContentWarning', () => {
  let React: ReturnType<typeof reactAndFriends>['React']; // tslint:disable-line:variable-name
  let ContentWarningDynamic: ComponentType; // tslint:disable-line:variable-name

  describe('in browser', () => {
    let renderToDom: ReturnType<typeof reactAndFriends>['renderToDom'];
    let ReactDOMTestUtils: ReturnType<typeof reactAndFriends>['ReactDOMTestUtils']; // tslint:disable-line:variable-name

    beforeEach(() => {
      resetModules();
      jest.doMock('react', () => {
        const react = (jest as any).requireActual('react');
        return { ...react, useEffect: react.useLayoutEffect };
      });

      ({React, renderToDom, ReactDOMTestUtils} = reactAndFriends());

      ContentWarningDynamic = require('./ContentWarning').default;
    });

    it('renders warning modal and hides it after clicking', async() => {
      renderToDom(<ContentWarningDynamic book={dummyBook} />);

      const b = document!.querySelector('button');

      expect(b).toBeTruthy();
      // Exercises the when-focus-is-already-in-the-modal branch
      b!.focus();

      ReactDOMTestUtils.act(() => ReactDOMTestUtils.Simulate.click(b!));

      expect(document!.querySelector('button')).toBeFalsy();
    });
  });

  describe('outside the browser', () => {
    const windowBackup = window;
    const documentBackup = document;

    let renderer: typeof rendererType;

    beforeEach(() => {
      delete (global as any).window;
      delete (global as any).document;
      resetModules();
      ({React, renderer} = reactAndFriends());

      ContentWarningDynamic = require('./ContentWarning').default;
    });

    afterEach(() => {
      (global as any).window = windowBackup;
      (global as any).document = documentBackup;
    });

    it('mounts and unmounts without a dom', () => {
      const component = renderer.create(<ContentWarningDynamic book={dummyBook} />);
      expect(() => component.unmount()).not.toThrow();
    });
  });
});
