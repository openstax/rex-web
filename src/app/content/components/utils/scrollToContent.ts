import scrollTo from 'scroll-to-element';
import { bookBannerDesktopMiniHeight, toolbarDesktopHeight } from '../constants';

const offset = -10 * (bookBannerDesktopMiniHeight + toolbarDesktopHeight); // height of navbar in px

export default function scrollToContent(elem: Element | string) {
    return scrollTo(elem, {offset});
}
