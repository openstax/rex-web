import React, { useEffect, useState } from 'react';
import { IntlShape } from 'react-intl';
import { useIntl } from 'react-intl';
import styled from 'styled-components/macro';
import BOOKS from '../../../config.books';
import { BookVersionConfig } from '../../../config.books';
import { DotMenuDropdown, DotMenuDropdownList } from '../../components/DotMenu';
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

  h3 {
    padding-bottom: 0;
  }

  small {
    margin-top: -0.2rem;
    color: #ccc;
  }
`;

export const exportBookHandler = (book: Book, intl: IntlShape) => () => {
  downloadFile(`${book.title}.csv`, generateBookPageSpreadsheet(book, intl));
};

// tslint:disable-next-line:variable-name
const Books = () => {
  const [books, setBooks] = useState<
    Array<[string, BookVersionConfig] | [string, BookVersionConfig, Book]>
  >(Object.entries(BOOKS));
  const {archiveLoader, osWebLoader} = useServices();
  const intl = useIntl();

  useEffect(() => {
    const bookLoader = makeUnifiedBookLoader(archiveLoader, osWebLoader);

    for (const [bookId, {defaultVersion}] of Object.entries(BOOKS)) {
      bookLoader(bookId, defaultVersion).then((bookData) => {
        setBooks((state) => state.map((data) => data[0] === bookId ? [data[0], data[1], bookData] : data));
      });
    }
  }, [archiveLoader, osWebLoader]);

  const renderBookLink = (id: string, book: Book | undefined) => {
    const page = book && findDefaultBookPage(book);
    return <>
      <div>
        <H3>{book && page
          ? <StyledContentLink book={book} page={page}>{book.title}</StyledContentLink>
          : <>&nbsp;</>}
        </H3>
        <small>{id}</small>
      </div>
      {book && page
        ? <DotMenuDropdown transparentTab={false}>
          <DotMenuDropdownList rightAlign>
            <DropdownItem message='i18n:dev:exportBookPages' onClick={exportBookHandler(book, intl)} />
          </DotMenuDropdownList>
        </DotMenuDropdown>
        : null
      }
    </>;
  };

  return <Panel title='Books'>
    <ul style={{paddingBottom: '5rem'}}>
      {books.map(([id, config, book]) => <BookLI key={id}>
        {renderBookLink(`${id}@${config.defaultVersion}`, book)}
      </BookLI>)}
    </ul>
  </Panel>;
};

export default Books;
