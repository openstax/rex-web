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

const makeScopedScroller = (container: HTMLElement | null) => {
  return async(target: HTMLElement | null) => {
    if (target && container) {
      await allImagesLoaded(container);
      scrollTo(target);
    }
  };
};

const makeScopedTargetFinder = (container: HTMLElement) => {
  return (hash: string): HTMLElement | null => {
    return container && typeof(window) !== 'undefined' && hash
      ? container.querySelector(`[id="${hash.replace(/^#/, '')}"]`)
      : null;
  };
};

const scrollToTop = () => {
  const window = assertWindow();
  resetTabIndex(window.document);
  window.scrollTo(0, 0);
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

  const scrollToTarget = makeScopedScroller(container);
  const getScrollTarget = makeScopedTargetFinder(container);

  return async(targets: ScrollTargets) => {
    console.log('start')
    const {page, hash, htmlNode} = targets;

    if (lastScrolledTo.page !== page) {
      scrollToTop();
      console.log('scrolled to top')
    }
    if (lastScrolledTo.hash !== hash) {
      await scrollToTarget(getScrollTarget(hash));
      console.log('scrolled to hash', hash)
    }
    if (htmlNode && lastScrolledTo.htmlNode !== htmlNode ) {
      await scrollToTarget(htmlNode);
      console.log('scrolled to htmlNode', htmlNode)
    }
    lastScrolledTo = targets;
    console.log('end')
  };
};

export default scrollTargetManager;

export const stubScrollTargetManager = async(_targets: ScrollTargets): Promise<void> => undefined;
