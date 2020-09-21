import { HTMLElement } from '@openstax/types/lib.dom';
import { scrollTo } from '../../../domUtils';
import * as selectNavigation from '../../../navigation/selectors';
import { AppState } from '../../../types';
import { assertWindow, memoizeStateToProps, resetTabIndex } from '../../../utils';
import * as select from '../../selectors';
import allImagesLoaded from '../utils/allImagesLoaded';

export const mapStateToScrollToTopOrHashProp = memoizeStateToProps((state: AppState) => ({
  hash: selectNavigation.hash(state),
  page: select.page(state),
}));
type ScrollTargetProp = ReturnType<typeof mapStateToScrollToTopOrHashProp>;

const scrollToTarget = (container: HTMLElement | null, hash: string) => {
  const target = getScrollTarget(container, hash);

  if (target && container) {
    allImagesLoaded(container).then(
      () => scrollTo(target)
    );
  }
};

const scrollToTargetOrTop = (container: HTMLElement | null, hash: string) => {
  if (getScrollTarget(container, hash)) {
    scrollToTarget(container, hash);
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

const scrollToTopOrHashManager = (
  container: HTMLElement
) => (previous: ScrollTargetProp, current: ScrollTargetProp) => {
  if (previous.page !== current.page) {
    scrollToTargetOrTop(container, current.hash);
  } else if (previous.hash !== current.hash) {
    scrollToTarget(container, current.hash);
  }
};

export default scrollToTopOrHashManager;

export const stubScrollToTopOrHashManager: ReturnType<typeof scrollToTopOrHashManager> =
  () => stubScrollToTopOrHashManager;
