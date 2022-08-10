export interface BookVersionConfig {
  defaultVersion: string;
  archiveOverride?: string;
  retired?: boolean;
}

export interface Books {
  [key: string]: BookVersionConfig;
}

declare const books: Books;
export = books;
