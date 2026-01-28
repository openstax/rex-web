import { HTMLElement } from '@openstax/types/lib.dom';
import React from 'react';
import ReactTestUtils from 'react-dom/test-utils';
import { act } from 'react-dom/test-utils';
import * as redux from 'react-redux';
import renderer from 'react-test-renderer';
import * as analytics from '../../helpers/analytics';
import { book } from '../../test/mocks/archiveLoader';
import { expectError, expectReactRenderError, renderToDom } from '../../test/reactutils';
import TestContainer from '../../test/TestContainer';
import AccessibilityButtonsWrapper from './AccessibilityButtonsWrapper';
import { HiddenButton } from './HiddenLink';
import MainContent from './MainContent';

describe('AccessibilityButtonsWrapper', () => {
    it('errors when no main content is provided', () => {
      const {node} = renderToDom(<TestContainer>
        <AccessibilityButtonsWrapper/>
      </TestContainer>);

      const breaks = () => act(() => {
        ReactTestUtils.Simulate.click(node);
      });

      expectError(
          'BUG: Expected mainComponent to be defined. Does AccessibilityButtonsWrapper contain a MainContent?',
          breaks);
    });

    it('fails when main is not wrapped in a AccessibilityButtonsWrapper', async() => {
      expectReactRenderError(
        'BUG: MainContent must be inside AccessibilityButtonsWrapper',
        () => <TestContainer><MainContent book={book}/></TestContainer>
      );
    });

    it('succeeds when main content is provided', () => {
      const {node} = renderToDom(<TestContainer>
          <AccessibilityButtonsWrapper>
            <MainContent book={book}/>
          </AccessibilityButtonsWrapper>
      </TestContainer>);

      expect(() =>
        act(() => { ReactTestUtils.Simulate.click(node); })
      ).not.toThrow();
    });

    it('scrolls and moves focus to mainContent when clicked (a11y)', () => {
        const {node, tree} = renderToDom(<TestContainer>
          <AccessibilityButtonsWrapper>
              <MainContent book={book}/>
          </AccessibilityButtonsWrapper>
        </TestContainer>);

        const wrapper = ReactTestUtils.findRenderedComponentWithType(tree, AccessibilityButtonsWrapper);

        if (!window) {
            expect(window).toBeTruthy();
        } else if (!wrapper.mainContent) {
            expect(wrapper.mainContent).toBeTruthy();
        } else {
            const mainContent = (wrapper.mainContent as unknown) as HTMLElement;
            const spyScroll = jest.spyOn(window, 'scrollTo');
            const spyFocus = jest.spyOn(mainContent, 'focus');

            ReactTestUtils.Simulate.click(node);

            expect(spyScroll).toHaveBeenCalledTimes(1);
            expect(spyScroll).toHaveBeenCalledWith(0, 0); // the vertical offset of the element

            expect(spyFocus).toHaveBeenCalledTimes(1);
        }
    });
});
