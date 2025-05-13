import { BooksConfig } from '../../gateways/createBookConfigLoader';
import { Route, RouteParams } from '../navigation/types';
import { TextResizerValue } from './constants';
import { State as HighlightState } from './highlights/types';
import { State as PracticeQuestionsState } from './practiceQuestions/types';
import { content } from './routes';
import { State as SearchState } from './search/types';
import { State as StudyGuidesState } from './studyGuides/types';

export type ContentQueryParams = {
  modal?: string,
  query?: string | null,
  target?: string,
};

export type SystemQueryParams = {
  archive?: string,
  'content-style'?: string,
};

export type SlugParams = {
  slug: string;
};
export type VersionParams = {
  contentVersion: string;
  archiveVersion?: string;
};
type VersionedSlugParams = SlugParams & VersionParams;

export type UuidParams = {
  uuid: string;
};
type VersionedUuidParams = UuidParams & VersionParams;

// Really could be ContentParams, but the content route is currently the only route in Rex
export type Params = {
  book: SlugParams | VersionedSlugParams | VersionedUuidParams | UuidParams;
  page: SlugParams | UuidParams;
  portalName?: string;
};

export type ContentRoute = Route<Params>;

export interface State {
  tocOpen: boolean | null;
  mobileMenuOpen: boolean;
  pageNotFoundId: string | null;
  params: Params | null;
  practiceQuestions: PracticeQuestionsState;
  loading: Partial<Params>;
  search: SearchState;
  showNudgeStudyTools: boolean | null;
  studyGuides: StudyGuidesState;
  highlights: HighlightState;
  book?: Book;
  page?: Page;
  references: Array<PageReferenceMap | PageReferenceError>;
  textSize: TextResizerValue | null;
  bookStylesUrl: string | null;
}

export interface PageReferenceMap extends PageReference {
  match: string;
}

export interface PageReferenceError {
  match: string;
  type: 'error';
}

export interface PageReference {
  params: RouteParams<typeof content>;
}

export interface BookWithOSWebData extends VersionedArchiveBookWithConfig {
  book_state: 'coming_soon' | 'deprecated' | 'live' | 'new_edition_available' | 'retired';
  theme: 'blue' | 'green' | 'gray' | 'yellow' | 'deep-green' | 'light-blue' | 'midnight' | 'orange' | 'red';
  slug: string;
  promote_image: null | {
    id: number;
    title: string;
    meta: {
      type: string;
      detail_url: string;
      download_url: string;
    }
  };
  content_warning_text: string | null;
  publish_date: string;
  amazon_link: string;
  polish_site_link: string;
  subject: string;
  subjects: Array<{subject_name: string}>;
  categories: Array<{subject_name: string; subject_category: string}>;
  authors: Array<{
    value: {
      name: string;
      senior_author: boolean;
    }
  }>;
}

export type Book = BookWithOSWebData | VersionedArchiveBookWithConfig;

export interface Page {
  abstract: string | null;
  id: string;
  title: string;
  slug: string;
  noindex?: boolean;
}

export interface ArchiveTreeNode {
  id: string;
  title: string;
  slug: string;
  toc_type?: string;
  toc_target_type?: string;
}

export type ArchiveTreeSectionType = 'book' | 'unit' | 'chapter' | 'page' | 'eoc-dropdown' | 'eob-dropdown';

export type ArchiveTreeSection = ArchiveTreeNode;

export interface LinkedArchiveTree extends ArchiveTree {
  parent?: LinkedArchiveTree;
}

export interface LinkedArchiveTreeSection extends ArchiveTreeSection {
  parent: LinkedArchiveTree;
}

export type LinkedArchiveTreeNode = LinkedArchiveTreeSection | LinkedArchiveTree;

export interface ArchiveTree extends ArchiveTreeSection {
  contents: Array<ArchiveTree | ArchiveTreeSection>;
}

export interface ArchiveBook {
  id: string;
  title: string;
  tree: ArchiveTree;
  version: string;
  language: string;
  license: {
    name: string;
    url: string;
    version: string;
  };
  revised: string;
  style_href?: string;
}

export interface ArchiveLoadOptions {
  contentVersion?: string;
  archiveVersion?: string;
  booksConfig: BooksConfig;
}

export type VersionedArchiveBookWithConfig = ArchiveBook & Required<VersionParams> & {
  loadOptions: ArchiveLoadOptions;
};

export interface ArchivePage {
  abstract: string | null;
  id: string;
  content: string;
  title: string;
  revised: string;
  slug: string;
  noindex?: boolean;
}

export type ArchiveContent = ArchivePage | ArchiveBook;
