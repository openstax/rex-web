import { ArchiveTree, ArchiveTreeSection } from './types';

export const isArchiveTree = (section: ArchiveTree | ArchiveTreeSection): section is ArchiveTree =>
  (section as ArchiveTree).contents !== undefined;
