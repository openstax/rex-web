import { HTMLElement } from '@openstax/types/lib.dom';

export const findScrollable = (element: HTMLElement | undefined): HTMLElement | undefined => {
  if (!element || element.scrollHeight > element.offsetHeight) {
    return element;
  }

  for (const child of Array.from(element.children)) {
    const scrollable = findScrollable(child as HTMLElement);
    if (scrollable) {
      return scrollable;
    }
  }
};

export const tocSectionIsVisible = (scrollable: HTMLElement, section: HTMLElement) => {
  return section.offsetTop > scrollable.scrollTop && section.offsetTop - scrollable.scrollTop < scrollable.offsetHeight;
};

export const scrollTocSectionIntoView = (sidebar: HTMLElement | undefined, activeSection: HTMLElement | undefined) => {
  const scrollable = findScrollable(sidebar);
  if (!activeSection || !scrollable || tocSectionIsVisible(scrollable, activeSection)) {
    return;
  }

  let search = activeSection.parentElement;
  let selectedChapter: undefined | HTMLElement;
  while (search && !selectedChapter && search !== scrollable) {
    if (search.nodeName === 'LI') {
      selectedChapter = search;
    }
    search = search.parentElement;
  }

  const chapterSectionDelta = selectedChapter && (activeSection.offsetTop - selectedChapter.offsetTop);
  const scrollTarget = selectedChapter && chapterSectionDelta && (chapterSectionDelta < scrollable.offsetHeight)
    ? selectedChapter
    : activeSection;

  scrollable.scrollTop = scrollTarget.offsetTop;
};
