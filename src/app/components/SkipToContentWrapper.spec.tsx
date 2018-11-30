import React, { ReactElement } from 'react';
import ReactDOM from 'react-dom';
import ReactTestUtils from 'react-dom/test-utils';
import MainContent from './MainContent';
import SkipToContentWrapper from './SkipToContentWrapper';
import { HTMLElement } from '@openstax/types/lib.dom';

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

describe('SkipToContentWrapper', () => {

    it('errors when no main content is provided', () => {
        const {node} = renderToDom(<SkipToContentWrapper/>);
        const breaks = () => ReactTestUtils.Simulate.click(node);
        expect(breaks).toThrowErrorMatchingSnapshot();
    });

    it('fails when main is not wrapped in a SkipToContentWrapper', () => {
        const breaks = () => renderToDom(<MainContent/>);
        expect(breaks).toThrowErrorMatchingSnapshot();
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
            expect(window).toBeTruthy()
        } else if (!component.mainContent) {
            expect(component.mainContent).toBeTruthy()
        } else {
            const mainContent = (component.mainContent as unknown) as HTMLElement
            const spyScroll = jest.spyOn(window, 'scrollTo');
            const spyFocus = jest.spyOn(mainContent, 'focus');
            
            ReactTestUtils.Simulate.click(node);
            
            expect(spyScroll).toHaveBeenCalledTimes(1);
            expect(spyScroll).toHaveBeenCalledWith(0, 0); // the vertical offset of the element
            
            expect(spyFocus).toHaveBeenCalledTimes(1);
            expect(spyFocus).toHaveBeenCalled();
        }
    });
});
