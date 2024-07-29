import { HTMLElement } from '@openstax/types/lib.dom';
import { scrollTo } from '../../../domUtils';
import * as selectNavigation from '../../../navigation/selectors';
import { AppState } from '../../../types';
import { assertWindow, memoizeStateToProps } from '../../../utils';
import { isSearchScrollTarget } from '../../search/guards';
import { selectedResult } from '../../search/selectors';
import * as select from '../../selectors';
import allImagesLoaded from '../utils/allImagesLoaded';

export const mapStateToScrollToTopOrHashProp = memoizeStateToProps((state: AppState) => ({
  hash: selectNavigation.hash(state),
  page: select.page(state),
  scrollTarget: selectNavigation.scrollTarget(state),
  selectedResult: selectedResult(state),
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

const scrollToTargetOrTop = (container: HTMLElement | null, hash: string, previous: boolean) => {
  if (getScrollTarget(container, hash)) {
    scrollToTarget(container, hash);
  } else if (previous) {
    assertWindow().scrollTo(0, 0);
  }
};

const getScrollTarget = (container: HTMLElement | null, hash: string): HTMLElement | null => {
  return container && typeof(window) !== 'undefined' && hash
    ? container.querySelector(`[id="${hash.replace(/^#/, '')}"]`)
    : null;
};

const scrollToTopOrHashManager = (
  container: HTMLElement
) => (previous: ScrollTargetProp | null, current: ScrollTargetProp) => {
  if (
    current.scrollTarget
    && isSearchScrollTarget(current.scrollTarget)
    && current.selectedResult
    && current.scrollTarget.elementId === current.selectedResult.result.source.elementId
    && current.scrollTarget.index === current.selectedResult.highlight
  ) {
    return;
  }
  if (previous?.page !== current.page) {
    scrollToTargetOrTop(container, current.hash, Boolean(previous));
  } else if (previous?.hash !== current.hash) {
    scrollToTarget(container, current.hash);
  }
};

export default scrollToTopOrHashManager;

export const stubScrollToTopOrHashManager: ReturnType<typeof scrollToTopOrHashManager> =
  () => stubScrollToTopOrHashManager;
