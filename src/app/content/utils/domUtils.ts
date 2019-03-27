import { HTMLElement } from '@openstax/types/lib.dom';

export const findScrollable = (element: HTMLElement | undefined): HTMLElement | undefined => {
  if (!element || element.scrollHeight > element.offsetHeight) {
    return element;
  }

  return Array.from(element.children).reduce<HTMLElement | undefined>(
    (result, child) => result || findScrollable(child as HTMLElement),
    undefined
  );
};

export const tocSectionIsVisible = (scrollable: HTMLElement, section: HTMLElement) => {
  return section.offsetTop > scrollable.scrollTop && section.offsetTop - scrollable.scrollTop < scrollable.offsetHeight;
};

export const findParentTocSection = (container: HTMLElement, section: HTMLElement) => {
  let search = section.parentElement;
  let selectedChapter: undefined | HTMLElement;
  while (search && !selectedChapter && search !== container) {
    if (search.nodeName === 'LI') {
      selectedChapter = search;
    }
    search = search.parentElement;
  }
  return selectedChapter;
};

const determineScrollTarget = (
  scrollable: HTMLElement,
  selectedChapter: HTMLElement | undefined,
  activeSection: HTMLElement
) => {
  const chapterSectionDelta = selectedChapter && (activeSection.offsetTop - selectedChapter.offsetTop);
  return selectedChapter && chapterSectionDelta && (chapterSectionDelta < scrollable.offsetHeight)
    ? selectedChapter
    : activeSection;
};

export const scrollTocSectionIntoView = (sidebar: HTMLElement | undefined, activeSection: HTMLElement | undefined) => {
  const scrollable = findScrollable(sidebar);
  if (!activeSection || !scrollable || tocSectionIsVisible(scrollable, activeSection)) {
    return;
  }

  const selectedChapter = findParentTocSection(scrollable, activeSection);
  const scrollTarget = determineScrollTarget(scrollable, selectedChapter, activeSection);

  scrollable.scrollTop = scrollTarget.offsetTop;
};
