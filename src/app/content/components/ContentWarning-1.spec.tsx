import { book as archiveBook } from '../../../test/mocks/archiveLoader';
import type { ComponentType } from 'react';
import { mockCmsBook } from '../../../test/mocks/osWebLoader';
import { reactAndFriends, resetModules } from '../../../test/utils';
import { formatBookData } from '../utils';

const dummyBook = {
  ...formatBookData(archiveBook, mockCmsBook),
  content_warning_text: 'some warning text',
};

const mockUseSelector = jest.fn().mockReturnValue(false);

describe('ContentWarning', () => {
  let React: ReturnType<typeof reactAndFriends>['React']; // tslint:disable-line:variable-name
  let ContentWarningDynamic: ComponentType<any>; // tslint:disable-line:variable-name

  describe('in browser', () => {
    let renderToDom: ReturnType<typeof reactAndFriends>['renderToDom'];
    let ReactDOMTestUtils: ReturnType<typeof reactAndFriends>['ReactDOMTestUtils']; // tslint:disable-line:variable-name
    let TestContainer: ReturnType<typeof reactAndFriends>['TestContainer'];  // tslint:disable-line:variable-name

    beforeEach(() => {
      resetModules();
      jest.doMock('react', () => {
        const react = (jest as any).requireActual('react');
        return { ...react, useEffect: react.useLayoutEffect };
      });
      jest.doMock('react-redux', () => {
        const actual = (jest as any).requireActual('react-redux');
        return { ...actual, useSelector: () => mockUseSelector() };
      });

      ({React, renderToDom, TestContainer, ReactDOMTestUtils} = reactAndFriends());

      ContentWarningDynamic = require('./ContentWarning').default;
    });

    it('renders warning modal and hides it after clicking', async() => {
      renderToDom(
        <TestContainer>
          <ContentWarningDynamic book={dummyBook} />
        </TestContainer>
      );

      const b = document!.querySelector('[href^="/accounts/login"]');

      expect(b).toBeTruthy();

      ReactDOMTestUtils.act(() => ReactDOMTestUtils.Simulate.click(b!));

      expect(document!.querySelector('button')).toBeFalsy();
      mockUseSelector.mockClear();
    });
  });

});
