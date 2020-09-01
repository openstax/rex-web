import { HTMLElement } from '@openstax/types/lib.dom';
import { scrollTo } from '../../../domUtils';
import * as selectNavigation from '../../../navigation/selectors';
import { AppState } from '../../../types';
import { assertWindow, memoizeStateToProps, resetTabIndex } from '../../../utils';
import * as select from '../../selectors';
import { Page } from '../../types';
import allImagesLoaded from '../utils/allImagesLoaded';

export const mapStateToScrollTargetProp = memoizeStateToProps((state: AppState) => ({
  hash: selectNavigation.hash(state),
  page: select.page(state),
  urlScrollTarget: selectNavigation.scrollTarget(state),
}));

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

interface ScrollTargets {
  hash: string;
  htmlNode: HTMLElement | undefined;
  page: Page | undefined;
}

const scrollTargetManager = (container: HTMLElement) => {
  let lastScrolledTo: ScrollTargets = {
    hash: '',
    htmlNode: undefined,
    page: undefined,
  };

  return async(targets: ScrollTargets) => {
    const {page, hash, htmlNode} = targets;

    if (lastScrolledTo.page !== page) {
      await scrollToTargetOrTop(container, hash);
    }
    if (lastScrolledTo.hash !== hash) {
      await scrollToTarget(container, hash);
    }
    if (htmlNode && lastScrolledTo.htmlNode !== htmlNode ) {
      scrollTo(htmlNode);
    }
    lastScrolledTo = targets;
  };
};

export default scrollTargetManager;

export const stubScrollTargetManager: ReturnType<typeof scrollTargetManager> = () => stubScrollTargetManager as any;
