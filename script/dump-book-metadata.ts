import fetch from 'node-fetch';
import { ARCHIVE_URL, REACT_APP_ARCHIVE_URL } from '../src/config';
import createArchiveLoader from '../src/gateways/createArchiveLoader';
import allBooks from '../src/config.books.json';
import { findTreePages } from '../src/app/content/utils/archiveTreeUtils';
import { ArchiveBook, ArchiveTreeSection } from '../src/app/content/types';
import { createDescription } from '../src/app/content/utils/seoUtils';

(global as any).fetch = fetch;

const archiveLoader = createArchiveLoader(`${ARCHIVE_URL}${REACT_APP_ARCHIVE_URL}`);

const getPageMetadata = async (section: ArchiveTreeSection, book: ArchiveBook, loader: ReturnType<(typeof archiveLoader)['book']>) => {
    const page = await loader.page(section.id).load();
    const description = createDescription(archiveLoader, book, page);
    console.log(`${book.title},${page.title},"${description.replace(/"/g, '""')}"`)
}

const getBookMetadata = async (id: string, version: string ) => {
    const loader = archiveLoader.book(id, version);
    const singleBook = await loader.load();
    const bookPages = findTreePages(singleBook.tree);
    
    for (const page of bookPages) {
        getPageMetadata(page, singleBook, loader);
    }
    
}

const getAllBooksMetadata = async () => {
    for(const [bookId, {defaultVersion}] of Object.entries(allBooks)) {
        await getBookMetadata(bookId, defaultVersion)
    }
}

getAllBooksMetadata();

// archiveLoader.allBooks.load().then((book: any) => {
//   if (field) {
//     // tslint:disable-next-line:no-console
//     console.log(book[field]);
//   } else {
//     // tslint:disable-next-line:no-console
//     console.log(JSON.stringify(book, null, 2));
//   }
// });
