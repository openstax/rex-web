import flow from 'lodash/fp/flow';
import identity from 'lodash/fp/identity';
import { AppServices } from '../../types';
import { Book, Page } from '../types';
import { resolveRelativeResources } from './contentManipulation';

export default function getCleanContent(
  book: Book | undefined,
  page: Page | undefined,
  archiveLoader: AppServices['archiveLoader'],
  transformer: (content: string) => string = identity
) {
  const bookLoader = book && page && archiveLoader.forBook(book);
  const cachedPage = bookLoader && page && bookLoader.page(page.id).cached();
  const contentUrl = bookLoader && page && bookLoader.page(page.id).url();

  if (!cachedPage || !contentUrl) {
    return '';
  }

  const replacements = (content: string) => content
    // remove body and surrounding content
    .replace(/^[\s\S]*<body.*?>|<\/body>[\s\S]*$/g, '')
    // fix assorted self closing tags
    .replace(/<(a|em|h3|iframe|span|strong|sub|sup|u|figcaption)([^>]*?)\/>/g, '<$1$2></$1>')
    // move (first-child) figure and table ids up to the parent div
    .replace(/(<div[^>]*)(>[^<]*<(?:figure|table)[^>]*?) (id=[^\s>]*)/g, '$1 $3$2 data-$3')
  ;

  const resolveResourceUrls = (content: string) => resolveRelativeResources(content, contentUrl);

  return flow(replacements, resolveResourceUrls, transformer)(cachedPage.content);
}
