export interface BookVersionConfig {
  defaultVersion: string;
  archiveOverride?: string;
  dynamicStyles?: boolean;
  retired?: boolean;
}

export interface Books {
  [key: string]: BookVersionConfig;
}

declare const books: Books;
export = books;
