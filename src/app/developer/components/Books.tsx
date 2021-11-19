import React, { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import styled from 'styled-components/macro';
import BOOKS from '../../../config.books';
import { DotMenuDropdown, DotMenuDropdownList, DotMenuToggle } from '../../components/DotMenu';
import { DropdownItem } from '../../components/Dropdown';
import { H3 } from '../../components/Typography';
import { StyledContentLink } from '../../content/components/ContentLink';
import { Book } from '../../content/types';
import { findDefaultBookPage, makeUnifiedBookLoader } from '../../content/utils';
import { useServices } from '../../context/Services';
import { downloadFile } from '../utils/downloadFile';
import { generateBookPageSpreadsheet } from '../utils/generateBookPageSpreadsheet';
import Panel from './Panel';

// tslint:disable-next-line:variable-name
const BookLI = styled.li`
  display: flex;
  flex-direction: row;
  overflow: visible;
  align-items: center;
  justify-content: space-between;
`;

// tslint:disable-next-line:variable-name
const Books = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const {archiveLoader, osWebLoader} = useServices();
  const intl = useIntl();

  useEffect(() => {
    const bookLoader = makeUnifiedBookLoader(archiveLoader, osWebLoader);

    for (const [bookId, {defaultVersion}] of Object.entries(BOOKS)) {
      bookLoader(bookId, defaultVersion).then((bookData) => {
        setBooks((state) => ([...state, bookData].sort((bookA, bookB) => bookA.title.localeCompare(bookB.title))));
      });
    }
  }, []);

  const renderBookLink = (book: Book) => {
    const page = findDefaultBookPage(book);
    return <>
      <H3><StyledContentLink book={book} page={page}>{book.title}</StyledContentLink></H3>
      <DotMenuDropdown toggle={<DotMenuToggle />} transparentTab={false}>
        <DotMenuDropdownList rightAlign>
          <DropdownItem message='i18n:dev:exportBookPages' onClick={() =>
            downloadFile(`${book.title}.csv`, generateBookPageSpreadsheet(book, intl))
          } />
        </DotMenuDropdownList>
      </DotMenuDropdown>
    </>;
  };

  return <Panel title='Books'>
    <ul style={{paddingBottom: '5rem'}}>
      {books.map((book) => <BookLI key={book.id}>
        {renderBookLink(book)}
      </BookLI>)}
    </ul>
  </Panel>;
};

export default Books;
