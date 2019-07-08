import scrollTo from 'scroll-to-element';
import { mobileBreak } from '../../../theme';
import {
  bookBannerDesktopMiniHeight,
  bookBannerMobileMiniHeight,
  toolbarDesktopHeight,
  toolbarMobileHeight
} from '../constants';

const pxPerRem = 10;
// height of navbar in px
const desktopOffset = -pxPerRem * (bookBannerDesktopMiniHeight + toolbarDesktopHeight);
const mobileOffset = -pxPerRem * (bookBannerMobileMiniHeight + toolbarMobileHeight);

export default function scrollToContent(elem: Element | string) {
    // innerWidth works best on Chrome
    // check other browsers at https://ryanve.com/lab/dimensions/
    // default to desktopOffset if window is undefined (at least the target is always visible)
    const offset = window && window.innerWidth <= pxPerRem * mobileBreak ? mobileOffset : desktopOffset;
    return scrollTo(elem, {offset});
}
