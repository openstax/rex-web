import { LinkedArchiveTree, LinkedArchiveTreeNode, LinkedArchiveTreeSection } from '../../types';

export type LocationFilters = Map<
  string,
  { section: LinkedArchiveTreeNode, children?: LinkedArchiveTreeSection[] }
>;

export type LocationFiltersWithChildren = Map<
  string,
  { section: LinkedArchiveTree, children: LinkedArchiveTreeSection[] }
>;

export interface FiltersChange<T> {
  remove: T[];
  new: T[];
}
