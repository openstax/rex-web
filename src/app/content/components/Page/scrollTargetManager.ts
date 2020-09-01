import { HTMLElement } from '@openstax/types/lib.dom';
import { scrollTo } from '../../../domUtils';
import * as selectNavigation from '../../../navigation/selectors';
import { AppState } from '../../../types';
import { assertWindow, memoizeStateToProps, resetTabIndex } from '../../../utils';
import * as select from '../../selectors';
import allImagesLoaded from '../utils/allImagesLoaded';

export const mapStateToScrollTargetProp = memoizeStateToProps((state: AppState) => ({
  hash: selectNavigation.hash(state),
  page: select.page(state),
}));
type ScrollTargetProp = ReturnType<typeof mapStateToScrollTargetProp> & {htmlNode?: HTMLElement};

const scrollToTarget = async(container: HTMLElement | null, hash: string) => {
  const target = getScrollTarget(container, hash);

  if (target && container) {
    await allImagesLoaded(container);
    scrollTo(target);
  }
};

const scrollToTargetOrTop = async(container: HTMLElement | null, hash: string) => {
  if (getScrollTarget(container, hash)) {
    await scrollToTarget(container, hash);
  } else {
    scrollToTop();
  }
};

const scrollToTop = () => {
  const window = assertWindow();
  resetTabIndex(window.document);
  window.scrollTo(0, 0);
};

const getScrollTarget = (container: HTMLElement | null, hash: string): HTMLElement | null => {
  return container && typeof(window) !== 'undefined' && hash
    ? container.querySelector(`[id="${hash.replace(/^#/, '')}"]`)
    : null;
};

const scrollTargetManager = (container: HTMLElement) => {
  let lastScrolledTo: ScrollTargetProp = {
    hash: '',
    htmlNode: undefined,
    page: undefined,
  };

  return async(prop: ScrollTargetProp) => {
    if (lastScrolledTo.page !== prop.page) {
      await scrollToTargetOrTop(container, prop.hash);
    }
    if (lastScrolledTo.hash !== prop.hash) {
      await scrollToTarget(container, prop.hash);
    }
    if (prop.htmlNode && lastScrolledTo.htmlNode !== prop.htmlNode ) {
      scrollTo(prop.htmlNode);
    }
    lastScrolledTo = prop;
  };
};

export default scrollTargetManager;

export const stubScrollTargetManager: ReturnType<typeof scrollTargetManager> = () => stubScrollTargetManager as any;
