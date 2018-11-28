import React, { ReactElement } from 'react';
import ReactDOM from 'react-dom';
import ReactTestUtils from 'react-dom/test-utils';
import SkipToContentWrapper from './SkipToContentWrapper';
import MainContent from './MainContent';

// Utility to handle nulls
function renderToDom<P>(component: ReactElement<P>) {
    const c = ReactTestUtils.renderIntoDocument(component);
    if (!c) {
        throw new Error(`BUG: Component was not rendered`)
    }
    const node = ReactDOM.findDOMNode(c)
    if (!node) {
        throw new Error(`BUG: Could not find DOM node`)
    }
    return {component: c, node};
}

describe('SkipToContentWrapper', () => {
    it('errors when no main content is provided', () => {
        const {node} = renderToDom(<SkipToContentWrapper/>);
        const breaks = () => ReactTestUtils.Simulate.click(node);
        expect(breaks).toThrowErrorMatchingSnapshot();
    })

    it('succeeds when main content is provided', () => {
        const {node} = renderToDom(<SkipToContentWrapper>
            <MainContent/>
        </SkipToContentWrapper>);

        const work = () => ReactTestUtils.Simulate.click(node);
        expect(work).not.toThrow();
    })

})