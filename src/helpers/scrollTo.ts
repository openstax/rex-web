import { Document, HTMLElement } from '@openstax/types/lib.dom';
import ReactDOM from 'react-dom';

// https://www.typescriptlang.org/docs/handbook/advanced-types.html#user-defined-type-guards
function isDocument(node: HTMLElement | Document): node is Document {
    return node === document;
}

// https://github.com/fisshy/react-scroll/blob/master/modules/mixins/utils.js#L24
const getScrollOffset = (w: Window, c: (HTMLElement | Document), t: HTMLElement) => {
    if (isDocument(c)) {
        return t.getBoundingClientRect().top + (w.scrollY || w.pageYOffset);
    } else {
        return w.getComputedStyle(c).position === 'relative' ?
            t.offsetTop : (t.getBoundingClientRect().top + c.scrollTop);
    }
};

export default function scrollTo(target: React.ReactInstance, offset?: number,
    container?: HTMLElement) {

    const c = container || document;
    if (window && c) {
        const t = ReactDOM.findDOMNode(target) as HTMLElement;
        const scrollOffset = getScrollOffset(window, c, t) + (offset || 0);
        if (isDocument(c)) {
            window.scrollTo(0, scrollOffset);
        } else {
            c.scrollTop = scrollOffset;
        }
    }
}
