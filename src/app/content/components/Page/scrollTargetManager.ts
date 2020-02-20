import { HTMLElement } from '@openstax/types/lib.dom';
import { scrollTo } from '../../../domUtils';
import * as selectNavigation from '../../../navigation/selectors';
import { AppState } from '../../../types';
import { assertWindow, resetTabIndex } from '../../../utils';
import { Page } from '../../types';
import allImagesLoaded from '../utils/allImagesLoaded';

export const mapStateToScrollTargetProp = (state: AppState) => ({
  hash: selectNavigation.hash(state),
  highlightId: selectNavigation.highlightId(state),
});

export interface ScrollTargets {
  hash?: string;
  highlight?: () => void;
  searchHighlight?: () => void;
}

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

const scrollTargetManager = (container: HTMLElement) => (
  scrollTargets: ScrollTargets,
  previousePage: Page | undefined,
  currentPage: Page | undefined
) => {
  const { hash, highlight, searchHighlight } = scrollTargets;

  if (hash) {
    scrollToTargetOrTop(container, hash);
  } else if (highlight) {
    highlight();
  } else if (searchHighlight) {
    searchHighlight();
  } else if (previousePage !== currentPage) {
    scrollToTop();
  }
};

export default scrollTargetManager;

export const stubScrollTargetManager: ReturnType<typeof scrollTargetManager> = () => stubScrollTargetManager;
