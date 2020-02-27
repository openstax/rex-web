import { HTMLElement } from '@openstax/types/lib.dom';
import { differenceWith } from 'lodash';
import { scrollTo } from '../../../domUtils';
import { ScrollTarget } from '../../../navigation/types';
import { assertWindow, resetTabIndex } from '../../../utils';
import { Page } from '../../types';
import allImagesLoaded from '../utils/allImagesLoaded';

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
  prevScrollTargets: ScrollTarget[],
  scrollTargets: ScrollTarget[],
  previousePage: Page | undefined,
  currentPage: Page | undefined
) => {
  const newScrollTargets = differenceWith(scrollTargets, prevScrollTargets, compareScrollTargets);

  if (newScrollTargets.length === 0 && previousePage !== currentPage) {
    scrollToTop();
    return;
  }

  const scrollTarget = newScrollTargets.sort(sortByPriority)[0];
  if (!scrollTarget) { return; }

  if (scrollTarget.type === 'hash') {
    scrollToTargetOrTop(container, scrollTarget.value);
  } else {
    allImagesLoaded(container).then(() => scrollTarget.scrollToFunction());
  }
};

export default scrollTargetManager;

export const stubScrollTargetManager: ReturnType<typeof scrollTargetManager> = () => stubScrollTargetManager;

const compareScrollTargets = (target1: ScrollTarget, target2: ScrollTarget) => {
  return target1.id === target2.id;
};

const sortByPriority = (target1: ScrollTarget, target2: ScrollTarget): number => {
  if (target1.type === 'hash' && target2.type !== 'hash') {
    return 1;
  } else if (target1.type !== 'hash' && target2.type === 'hash') {
    return -1;
  }

  return 0;
};
