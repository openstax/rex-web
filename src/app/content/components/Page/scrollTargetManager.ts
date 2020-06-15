import { HTMLElement } from '@openstax/types/lib.dom';
import { differenceWith } from 'lodash';
import { scrollTo } from '../../../domUtils';
import { hash as hashSelector } from '../../../navigation/selectors';
import { ScrollTarget, ScrollTargetError, ScrollTargetHash } from '../../../navigation/types';
import { AppState } from '../../../types';
import { assertWindow, resetTabIndex } from '../../../utils';
import { query } from '../../search/selectors';
import { Page } from '../../types';
import allImagesLoaded from '../utils/allImagesLoaded';
import { stubHighlightManager } from './highlightManager';
import { HighlightProp as SearchHighlightProp, Options, stubManager } from './searchHighlightManager';

export const mapStateToScrollTargetHashProp = (state: AppState): ScrollTargetHash | null => {
  const search = query(state);
  const hashTarget = hashSelector(state);

  if (search || !hashTarget) { return null; }

  return {
    id: hashTarget,
    type: 'hash',
    value: hashTarget,
  };
};

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

const getScrollTargets = (
  searchHighlightManager: typeof stubManager,
  highlightManager: typeof stubHighlightManager,
  scrollTargetHash: ScrollTargetHash | null,
  previousSearchHighlights: SearchHighlightProp,
  currentSearchHighlights: SearchHighlightProp,
  searchHighlightManagerOptions: Options
): { scrollTargets: ScrollTarget[], error?: ScrollTargetError} => {
  const scrollTargets: ScrollTarget[] = [];

  if (scrollTargetHash) {
    scrollTargets.push(scrollTargetHash);
  }

  const searchHighlightScrollTarget = searchHighlightManager.getScrollTarget(
    previousSearchHighlights,
    currentSearchHighlights,
    searchHighlightManagerOptions
  );
  if (searchHighlightScrollTarget) {
    scrollTargets.push(searchHighlightScrollTarget);
  }

  try {
    const highlightScrollTarget = highlightManager.getScrollTarget();
    if (highlightScrollTarget) {
      scrollTargets.push(highlightScrollTarget);
    }
  } catch (error) {
    if (error instanceof ScrollTargetError) {
      return {scrollTargets, error};
    }
  }

  return {scrollTargets};
};

const scrollTargetManager = (
  container: HTMLElement,
  searchHighlightManager: typeof stubManager,
  highlightManager: typeof stubHighlightManager
) => async(
  prevScrollTargets: ScrollTarget[],
  scrollTargetHash: ScrollTargetHash | null,
  previousSearchHighlights: SearchHighlightProp,
  currentSearchHighlights: SearchHighlightProp,
  searchHighlightManagerOptions: Options,
  previousePage: Page | undefined,
  currentPage: Page | undefined
): Promise<{ scrollTargets: ScrollTarget[], error?: ScrollTargetError}> => {

  const {scrollTargets, error} = getScrollTargets(
    searchHighlightManager,
    highlightManager,
    scrollTargetHash,
    previousSearchHighlights,
    currentSearchHighlights,
    searchHighlightManagerOptions);

  if (error) {
    return {scrollTargets, error};
  }

  const newScrollTargets = differenceWith(scrollTargets, prevScrollTargets, compareScrollTargets);

  if (newScrollTargets.length === 0 && previousePage !== currentPage) {
    scrollToTop();
    return {scrollTargets};
  }

  const scrollTarget = newScrollTargets.sort(sortByPriority)[0];
  if (!scrollTarget) { return {scrollTargets}; }

  try {
    if (scrollTarget.type === 'hash') {
      scrollToTargetOrTop(container, scrollTarget.value);
    } else {
      await allImagesLoaded(container);
      scrollTarget.scrollToFunction();
    }
  } catch (e) {
    if (e instanceof ScrollTargetError) {
      return {scrollTargets, error: e};
    }
  }

  return {scrollTargets};
};

export default scrollTargetManager;

export const stubScrollTargetManager: ReturnType<typeof scrollTargetManager> = () => stubScrollTargetManager as any;

const compareScrollTargets = (target1: ScrollTarget, target2: ScrollTarget) => {
  return target1.id === target2.id;
};

const sortByPriority = (target1: ScrollTarget, target2: ScrollTarget): number => {
  if (target1.type !== 'hash' && target2.type === 'hash') {
    return 1;
  } else if (target1.type === 'hash' && target2.type !== 'hash') {
    return -1;
  }

  return 0;
};
