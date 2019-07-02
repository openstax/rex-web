import { bookBannerDesktopMiniHeight, toolbarDesktopHeight } from '../constants';
import scrollTo from 'scroll-to-element';

const offset = -10 * (bookBannerDesktopMiniHeight + toolbarDesktopHeight); // height of navbar in px

export default function scrollToContent(elem_or_selector: any) {
    return scrollTo(elem_or_selector, {offset});
}
