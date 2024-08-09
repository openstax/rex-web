import { BookWithOSWebData, ArchiveTreeNode, ArchiveTree } from '../../src/app/content/types';
import { content } from '../../src/app/content/routes';
import { writeAssetFile } from './fileUtils';
import { stripIdVersion } from '../../src/app/content/utils/idUtils';
import { splitTitleParts } from '../../src/app/content/utils/archiveTreeUtils';

const quoteValue = (value?: string) => value ? `"${value.replace(/"/g, '""')}"` : '""';

export const renderAndSaveContentManifest = async(
  saveFile: (path: string, contents: string) => Promise<unknown>,
  books: BookWithOSWebData[]
) => {

  const rows = books.map(book => getContentsRows(book, book.tree))
    .reduce((result, item) => ([...result, ...item]), [] as string[][]);

  const manifestText = [
    ['id', 'title', 'text title', 'language', 'slug', 'url', 'toc type', 'toc target type'],
    ...rows,
  ].map(row => row.map(quoteValue).join(',')).join('\n');

  await saveFile('/rex/content-metadata.csv', manifestText);
};

function getContentsRows(
  book: BookWithOSWebData,
  node: ArchiveTree | ArchiveTreeNode,
  chapterNumber?: string
): string[][] {
  const {title, toc_target_type} = node;
  const [titleNumber, titleString] = splitTitleParts(node.title);
  const textTitle = `${titleNumber || chapterNumber || ''} ${titleString}`.replace(/\s+/, ' ').trim();
  const id = stripIdVersion(node.id);
  const tocType = node.toc_type ?? (id === book.id ? 'book' : '');

  const urlParams = tocType === 'book'
    ? [node.slug, '']
    : 'contents' in node
      ? ['', '']
      : [node.slug, content.getUrl({book: {slug: book.slug}, page: {slug: node.slug}})];

  const contents = 'contents' in node
    ? node.contents.map(child => getContentsRows(book, child, titleNumber || chapterNumber))
      .reduce((result, item) => ([...result, ...item]), [] as string[][])
    : [];

  return [
    [stripIdVersion(id), title, textTitle, book.language, ...urlParams, tocType, toc_target_type ?? ''],
    ...contents,
  ];
}


// simple helper for local
const writeAssetFileAsync = async(filepath: string, contents: string) => {
  return writeAssetFile(filepath, contents);
};
export const renderContentManifest = async(books: BookWithOSWebData[]) => {
  return renderAndSaveContentManifest(writeAssetFileAsync, books);
};
