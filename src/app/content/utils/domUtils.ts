import { HTMLElement } from '@openstax/types/lib.dom';

export const scrollTocSectionIntoView = (sidebar: HTMLElement | undefined, activeSection: HTMLElement | undefined) => {
  if (!activeSection || !sidebar) {
    return;
  }

  // do nothing if the LI is already visible
  if (activeSection.offsetTop > sidebar.scrollTop
    && activeSection.offsetTop - sidebar.scrollTop < sidebar.offsetHeight) {
    return;
  }

  let search = activeSection.parentElement;
  let selectedChapter: undefined | HTMLElement;
  while (search && !selectedChapter && search !== sidebar) {
    if (search.nodeName === 'LI') {
      selectedChapter = search;
    }
    search = search.parentElement;
  }

  const chapterSectionDelta = selectedChapter && (activeSection.offsetTop - selectedChapter.offsetTop);
  const scrollTarget = selectedChapter && chapterSectionDelta && (chapterSectionDelta < sidebar.offsetHeight)
    ? selectedChapter
    : activeSection;

  sidebar.scrollTop = scrollTarget.offsetTop;
};
