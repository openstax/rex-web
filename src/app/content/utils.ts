import flatten from 'lodash/fp/flatten';
import { isArchiveTree } from './guards';
import { ArchiveTree, ArchiveTreeSection } from './types';

export const stripIdVersion = (id: string): string => id.split('@')[0];
export const getIdVersion = (id: string): string | undefined => id.split('@')[1];

export const getContentPageReferences = (content: string) =>
  (content.match(/\/contents\/([a-z0-9\-]+(@[\d\.]+)?)(:([a-z0-9\-]+(@[\d\.]+)?))?/g) || [])
    .map((match) => {
      const id = match.substr(10);
      const bookId = id.indexOf(':') > -1 && id.split(':')[0];
      const pageId = id.indexOf(':') > -1 ? id.split(':')[1] : id;

      return {
        bookUid: bookId ? stripIdVersion(bookId) : undefined,
        bookVersion: bookId ? getIdVersion(bookId) : undefined,
        match,
        pageUid: stripIdVersion(pageId),
      };
    });

export function flattenArchiveTree(contents: ArchiveTree['contents']): ArchiveTreeSection[] {
  return flatten(contents.map((section) =>
    flatten(isArchiveTree(section) ? flattenArchiveTree(section.contents) : [section]))
  ).map((section) => ({
    id: stripIdVersion(section.id),
    shortId: stripIdVersion(section.shortId),
    title: section.title,
    version: getIdVersion(section.id),
  }));
}
