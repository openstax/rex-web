import { HTMLElement } from '@openstax/types/lib.dom';
import isEqual from 'lodash/fp/isEqual';
import { scrollTo } from '../../../domUtils';
import * as selectNavigation from '../../../navigation/selectors';
import { ScrollTarget } from '../../../navigation/types';
import { AppState } from '../../../types';
import { assertWindow, resetTabIndex } from '../../../utils';
import * as select from '../../selectors';
import allImagesLoaded from '../utils/allImagesLoaded';

export const mapStateToScrollTargetProp = (state: AppState) => ({
  page: select.page(state),
  target: selectNavigation.scrollTarget(state),
});
type ScrollTargetProp = ReturnType<typeof mapStateToScrollTargetProp>;

const scrollToTarget = (container: HTMLElement | null, scrollTarget: ScrollTarget) => {
  const target = getScrollTarget(container, scrollTarget);
  if (target && container) {
    allImagesLoaded(container).then(
      () => scrollTo(target)
    );
  }
};

const scrollToTargetOrTop = (container: HTMLElement | null, scrollTarget: ScrollTarget | undefined) => {
  if (scrollTarget && getScrollTarget(container, scrollTarget)) {
    scrollToTarget(container, scrollTarget);
  } else {
    scrollToTop();
  }
};

const scrollToTop = () => {
  const window = assertWindow();
  resetTabIndex(window.document);
  window.scrollTo(0, 0);
};

const getScrollTarget = (
  container: HTMLElement | null, { type, value }: ScrollTarget
): HTMLElement | null => {
  if (!container || typeof(window) === 'undefined') { return null; }

  if (type === 'hash') {
    return container.querySelector(`[id="${value.replace(/^#/, '')}"]`);
  } else if (type === 'highlight') {
    return container.querySelector(`[data-highlight-id="${value}"]`);
  }

  return null;
};

const scrollTargetManager = (container: HTMLElement) => (
  previous: ScrollTargetProp,
  current: ScrollTargetProp
) => {
  if (previous.page !== current.page) {
    scrollToTargetOrTop(container, current.target);
  } else if (current.target && !isEqual(previous.target, current.target)) {
    scrollToTarget(container, current.target);
  }
};

export default scrollTargetManager;

export const stubScrollTargetManager: ReturnType<typeof scrollTargetManager> = () => stubScrollTargetManager;
