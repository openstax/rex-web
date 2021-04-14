import fetch from 'node-fetch';
import { ArchiveBook, LinkedArchiveTree, LinkedArchiveTreeSection } from '../src/app/content/types';
import { findTreePages } from '../src/app/content/utils/archiveTreeUtils';
import { createDescription, getParentPrefix, getTextContent } from '../src/app/content/utils/seoUtils';
import { ARCHIVE_URL, REACT_APP_ARCHIVE_URL } from '../src/config';
import allBooks from '../src/config.books.json';
import createArchiveLoader from '../src/gateways/createArchiveLoader';

(global as any).fetch = fetch;

const archiveLoader = createArchiveLoader(`${ARCHIVE_URL}${REACT_APP_ARCHIVE_URL}`);

const getPageMetadata = async(
        section: LinkedArchiveTreeSection | LinkedArchiveTree,
        book: ArchiveBook,
        loader: ReturnType<(typeof archiveLoader)['book']>
    ) => {
        const page = await loader.page(section.id).load();
        const description = createDescription(archiveLoader, book, page);
        const sectionTitle = getTextContent(section.title);
        const parentPrefix = getParentPrefix(section.parent).trim();

        const row = `"${book.title}","${parentPrefix}","${sectionTitle}","${description}"`;
        // tslint:disable-next-line:no-console
        console.log(row);
};

const getBookMetadata = async(id: string, version: string) => {
    const loader = archiveLoader.book(id, version);
    const singleBook = await loader.load();
    const bookPages = findTreePages(singleBook.tree);
    for (const page of bookPages) {
        getPageMetadata(page, singleBook, loader);
    }
};

const getAllBooksMetadata = async() => {
    for (const [bookId, { defaultVersion }] of Object.entries(allBooks)) {
        await getBookMetadata(bookId, defaultVersion);
    }
};

getAllBooksMetadata();
