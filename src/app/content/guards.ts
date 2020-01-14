import {
  ArchiveTree,
  ArchiveTreeSection,
  LinkedArchiveTree,
  LinkedArchiveTreeSection,
  Params,
  SlugParams,
  UuidParams,
  VersionedSlugParams
} from './types';

export const isArchiveTree = (section: ArchiveTree | ArchiveTreeSection): section is ArchiveTree =>
  (section as ArchiveTree).contents !== undefined;
export const isLinkedArchiveTree =
  (section: LinkedArchiveTree | LinkedArchiveTreeSection): section is LinkedArchiveTree =>
    (section as LinkedArchiveTree).contents !== undefined;
export const isLinkedArchiveTreeSection =
  (section: LinkedArchiveTree | LinkedArchiveTreeSection): section is LinkedArchiveTreeSection =>
    (section as LinkedArchiveTree).contents === undefined && section.parent !== undefined;

export const paramsAreSlugParams = (params: Params): params is SlugParams | VersionedSlugParams =>
  'book' in Object.keys(params);
export const paramsAreUuidParams = (params: Params): params is UuidParams =>
  'uuid' in Object.keys(params);
