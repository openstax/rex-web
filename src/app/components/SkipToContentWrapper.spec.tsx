import { HTMLElement } from '@openstax/types/lib.dom';
import React from 'react';
import ReactTestUtils from 'react-dom/test-utils';
import { expectError, renderToDom } from '../../test/reactutils';
import MessageProvider from '../MessageProvider';
import MainContent from './MainContent';
import SkipToContentWrapper from './SkipToContentWrapper';

describe('SkipToContentWrapper', () => {

    beforeEach(() => {
        if (window) {
            // In JSDom on travis: `window.scrollTo` is not defined so we define it here
            window.scrollTo = () => { /* do nothing */ };
        }
    });

    it('errors when no main content is provided', () => {
        debugger
        const {node} = renderToDom(<MessageProvider>
            <SkipToContentWrapper/>
        </MessageProvider>);
        const breaks = () => ReactTestUtils.Simulate.click(node);
        expectError('BUG: Expected mainComponent to be defined. Does SkipToContentWrapper contain a MainContent?',
            breaks);
    });

    it('fails when main is not wrapped in a SkipToContentWrapper', () => {
        const breaks = () => renderToDom(<MessageProvider>
            <MainContent/>
        </MessageProvider>);
        expectError('BUG: MainContent must be inside SkipToContentWrapper', breaks);
    });

    it('succeeds when main content is provided', () => {
        const {node} = renderToDom(<MessageProvider>
            <SkipToContentWrapper>
                <MainContent/>
            </SkipToContentWrapper>
        </MessageProvider>);

        const works = () => ReactTestUtils.Simulate.click(node);
        expect(works).not.toThrow();
    });

    it('scrolls and moves focus to mainContent when clicked (a11y)', () => {
        const {node, component} = renderToDom(<MessageProvider>
            <SkipToContentWrapper>
                <MainContent/>
            </SkipToContentWrapper>
        </MessageProvider>);

        if (!window) {
            expect(window).toBeTruthy();
        } else if (!component.mainContent) {
            expect(component.mainContent).toBeTruthy();
        } else {
            const mainContent = (component.mainContent as unknown) as HTMLElement;
            const spyScroll = jest.spyOn(window, 'scrollTo');
            const spyFocus = jest.spyOn(mainContent, 'focus');

            ReactTestUtils.Simulate.click(node);

            expect(spyScroll).toHaveBeenCalledTimes(1);
            expect(spyScroll).toHaveBeenCalledWith(0, 0); // the vertical offset of the element

            expect(spyFocus).toHaveBeenCalledTimes(1);
        }
    });
});
