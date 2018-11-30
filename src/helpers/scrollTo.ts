import { HTMLElement } from '@openstax/types/lib.dom';
import ReactDOM from 'react-dom';

// https://github.com/fisshy/react-scroll/blob/master/modules/mixins/utils.js#L24
const getScrollOffset = (t: HTMLElement, w: Window) => {
    return t.getBoundingClientRect().top + (w.scrollY || w.pageYOffset);
};

const scrollToWithWindow = (target: React.ReactInstance, window: Window) => {
    const t = ReactDOM.findDOMNode(target) as HTMLElement;
    const scrollOffset = getScrollOffset(t, window);
    window.scrollTo(0, scrollOffset);
    t.focus();
}

export default function scrollTo(target: React.ReactInstance) {
    window && scrollToWithWindow(target, window);
}
