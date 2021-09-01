interface Books {
  [key: string]: {
    defaultVersion: string;
    archiveOverride?: string;
  };
}

declare const books: Books;
export = books;
