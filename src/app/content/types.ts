
export interface Params {
  bookId: string;
  pageId: string;
}

export interface State {
  tocOpen: boolean;
  params?: Params;
  loading: {
    book?: string;
    page?: string;
  };
  book?: Book;
  page?: Page;
}

export interface Book {
  id: string;
  shortId: string;
  title: string;
  version: string;
}

export interface Page {
  id: string;
  shortId: string;
  title: string;
  version: string;
}

export interface ArchiveTreeSection {
  id: string;
  shortId: string;
  title: string;
}

export interface ArchiveTree extends ArchiveTreeSection {
  contents: ArchiveTree[];
}

export interface ArchiveBook {
  id: string;
  shortId: string;
  tree: ArchiveTree;
  version: string;
  title: string;
}

export interface ArchivePage {
  id: string;
  shortId: string;
  content: string;
  version: string;
  title: string;
}

export type ArchiveContent = ArchivePage | ArchiveBook;
