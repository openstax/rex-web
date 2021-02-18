import { isObject } from 'lodash/fp';
import {
  ArchiveTree,
  ArchiveTreeSection,
  Book,
  BookWithOSWebData,
  LinkedArchiveTree,
  LinkedArchiveTreeSection,
  PageReferenceMapError,
  ReferenceLoadingError
} from './types';
import { ContentPageRefencesType } from './utils';

export const isArchiveTree = (section: ArchiveTree | ArchiveTreeSection): section is ArchiveTree =>
  (section as ArchiveTree).contents !== undefined;
export const isLinkedArchiveTree =
  (section: LinkedArchiveTree | LinkedArchiveTreeSection): section is LinkedArchiveTree =>
    (section as LinkedArchiveTree).contents !== undefined;
export const isLinkedArchiveTreeSection =
  (section: LinkedArchiveTree | LinkedArchiveTreeSection): section is LinkedArchiveTreeSection =>
    (section as LinkedArchiveTree).contents === undefined && section.parent !== undefined;

export const hasOSWebData = (book: Book | undefined): book is BookWithOSWebData =>
  book ? 'slug' in book : false;

export const isReferenceLoadingError = (something: any): something is ReferenceLoadingError =>
  something instanceof ReferenceLoadingError;

export const isContentPageRefencesType = (something: any): something is ContentPageRefencesType =>
  isObject(something)
  && typeof (something as ContentPageRefencesType).match === 'string'
  && typeof (something as ContentPageRefencesType).pageId === 'string';

export const isPageReferenceMapError = (something: any): something is PageReferenceMapError =>
  isObject(something)
  && (something as PageReferenceMapError).type === 'error'
  && isContentPageRefencesType((something as PageReferenceMapError).reference);
