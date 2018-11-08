
export interface Params {
  bookId: string;
  pageId: string;
}

export interface State {
  tocOpen: boolean;
  params?: Params;
}
