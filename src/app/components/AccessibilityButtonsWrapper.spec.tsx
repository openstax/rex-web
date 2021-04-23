import { HTMLElement } from '@openstax/types/lib.dom';
import React from 'react';
import ReactTestUtils from 'react-dom/test-utils';
import createTestServices from '../../test/createTestServices';
import { expectError, renderToDom } from '../../test/reactutils';
import * as Services from '../context/Services';
import MessageProvider from '../MessageProvider';
import AccessibilityButtonsWrapper from './AccessibilityButtonsWrapper';
import MainContent from './MainContent';

describe('AccessibilityButtonsWrapper', () => {
    let services: ReturnType<typeof createTestServices>;

    beforeEach(() => {
        services = createTestServices();
      });

    it('errors when no main content is provided', () => {
        const {node} = renderToDom(<Services.Provider value={services}>
          <MessageProvider>
            <AccessibilityButtonsWrapper/>
          </MessageProvider>
        </Services.Provider>);
        const breaks = () => ReactTestUtils.Simulate.click(node);
        expectError(
            'BUG: Expected mainComponent to be defined. Does AccessibilityButtonsWrapper contain a MainContent?',
            breaks);
    });

    it('fails when main is not wrapped in a AccessibilityButtonsWrapper', () => {
        const breaks = () => renderToDom(<Services.Provider value={services}>
          <MessageProvider>
            <MainContent/>
          </MessageProvider>
        </Services.Provider>);
        expectError('BUG: MainContent must be inside AccessibilityButtonsWrapper', breaks);
    });

    it('succeeds when main content is provided', () => {
        const {node} = renderToDom(<Services.Provider value={services}>
            <MessageProvider>
              <AccessibilityButtonsWrapper>
                <MainContent/>
              </AccessibilityButtonsWrapper>
          </MessageProvider>
        </Services.Provider>);

        const works = () => ReactTestUtils.Simulate.click(node);
        expect(works).not.toThrow();
    });

    it('scrolls and moves focus to mainContent when clicked (a11y)', () => {
        const {node, tree} = renderToDom(<Services.Provider value={services}>
          <MessageProvider>
            <AccessibilityButtonsWrapper>
                <MainContent/>
            </AccessibilityButtonsWrapper>
          </MessageProvider>
        </Services.Provider>);

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
