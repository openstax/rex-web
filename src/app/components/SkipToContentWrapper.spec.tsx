import { HTMLElement } from '@openstax/types/lib.dom';
import React, { ReactElement } from 'react';
import ReactDOM from 'react-dom';
import ReactTestUtils from 'react-dom/test-utils';
import MainContent from './MainContent';
import SkipToContentWrapper from './SkipToContentWrapper';

// Utility to handle nulls
function renderToDom<P>(component: ReactElement<P>) {
    const c = ReactTestUtils.renderIntoDocument(component) as SkipToContentWrapper;
    if (!c) {
        throw new Error(`BUG: Component was not rendered`);
    }
    const node = ReactDOM.findDOMNode(c);
    if (!node) {
        throw new Error(`BUG: Could not find DOM node`);
    }
    return {component: c, node};
}

// JSDom logs to console.error when an Error is thrown.
// Disable the console just in this instance, and re-enable after.
// See https://github.com/facebook/jest/pull/5267#issuecomment-356605468
function expectError(message: string, fn: () => void) {
    const consoleError = jest.spyOn(console, 'error');
    consoleError.mockImplementation(() => {});
    
    try {
        fn();
        expect('Code should not have succeeded').toBeFalsy();
    } catch (err) {
        expect(err.message).toBe(message);
    } finally {
        consoleError.mockRestore();
    }
}

describe('SkipToContentWrapper', () => {

    beforeEach(() => {
        if (window) {
            // In JSDom on travis: `window.scrollTo` is not defined so we define it here
            window.scrollTo = () => { /* do nothing */ };
        }
    });

    it('errors when no main content is provided', () => {
        const {node} = renderToDom(<SkipToContentWrapper/>);
        const breaks = () => ReactTestUtils.Simulate.click(node);
        expectError('BUG: Expected mainComponent to be defined. Does SkipToContentWrapper contain a MainContent?', breaks)
    });

    it('fails when main is not wrapped in a SkipToContentWrapper', () => {
        const breaks = () => renderToDom(<MainContent/>);
        expectError('BUG: MainContent must be inside SkipToContentWrapper', breaks);
    });

    it('succeeds when main content is provided', () => {
        const {node} = renderToDom(<SkipToContentWrapper>
            <MainContent/>
        </SkipToContentWrapper>);

        const works = () => ReactTestUtils.Simulate.click(node);
        expect(works).not.toThrow();
    });

    it('scrolls and moves focus to mainContent when clicked (a11y)', () => {
        const {node, component} = renderToDom(<SkipToContentWrapper>
            <MainContent/>
        </SkipToContentWrapper>);

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
