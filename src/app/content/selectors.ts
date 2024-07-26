import { createSelector } from 'reselect';
import * as parentSelectors from '../selectors';
import { defaultTheme } from './components/constants';
import { hasOSWebData } from './guards';
import { getIdFromPageParam } from './utils';
import {
  archiveTreeSectionIsChapter,
  findArchiveTreeNode,
  findArchiveTreeNodeByPageParam,
  prevNextBookPage,
} from './utils/archiveTreeUtils';

export const localState = createSelector(
  parentSelectors.localState,
  (parentState) => parentState.content
);

export const tocOpen = createSelector(
  localState,
  (state) => !state.search.query && state.tocOpen
);

export const mobileMenuOpen = createSelector(
  localState,
  (state) => state.mobileMenuOpen
);

export const book = createSelector(
  localState,
  (state) => state.book
);

export const bookTheme = createSelector(
  book,
  (currentBook) => hasOSWebData(currentBook) ? currentBook.theme : defaultTheme
);

export const showNudgeStudyTools = createSelector(
  localState,
  (state) => state.showNudgeStudyTools
);

export const contentReferences = createSelector(
  localState,
  (state) => state.references
);

export const page = createSelector(
  localState,
  (state) => state.page
);

export const loading = createSelector(
  localState,
  (state) => state.loading
);

export const loadingBook = createSelector(
  loading,
  (slugs) => slugs.book
);

export const loadingPage = createSelector(
  loading,
  (slugs) => slugs.page
);

export const contentParams = createSelector(
  localState,
  (state) => state.params
);

export const pageParam = createSelector(
  contentParams,
  (params) => params ? params.page : null
);

export const pageNotFound = createSelector(
  localState,
  pageParam,
  (state, param) => getIdFromPageParam(param) === state.pageNotFoundId
);

export const pageNode = createSelector(
  book,
  pageParam,
  (selectedBook, selectedPageParam) => selectedBook && selectedPageParam
    ? findArchiveTreeNodeByPageParam(selectedBook.tree, selectedPageParam)
    : undefined
);

export const bookAndPage = createSelector(
  book,
  page,
  (selectedBook, selectedPage) => ({book: selectedBook, page: selectedPage})
);

export const firstChapter = createSelector(
  book,
  (selectedBook) =>
  selectedBook && selectedBook.tree && findArchiveTreeNode(archiveTreeSectionIsChapter, selectedBook.tree)
);

export const prevNextPage = createSelector(
  book,
  page,
  (selectedBook, selectedPage) => selectedBook && selectedPage
    ? prevNextBookPage(selectedBook, selectedPage.id)
    : null
);

export const textSize = createSelector(
  localState,
  (state) => state.textSize
);

export const bookStylesUrl = createSelector(
  localState,
  (state) => state.bookStylesUrl
);
