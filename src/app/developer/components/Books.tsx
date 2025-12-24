import React, { useEffect, useState } from 'react';
import styled from 'styled-components/macro';
import { BookVersionConfig } from '../../../config.books';
import { getBooksConfigSync } from '../../../gateways/createBookConfigLoader';
import { DotMenuDropdown, DotMenuDropdownList } from '../../components/DotMenu';
import { DropdownItem } from '../../components/Dropdown';
import { H3 } from '../../components/Typography';
import { StyledContentLink } from '../../content/components/ContentLink';
import { Book } from '../../content/types';
import { findDefaultBookPage, makeUnifiedBookLoader } from '../../content/utils';
import { useServices } from '../../context/Services';
import { AppServices } from '../../types';
import { downloadFile } from '../utils/downloadFile';
import { generateBookPageSpreadsheet } from '../utils/generateBookPageSpreadsheet';
import Panel from './Panel';

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

export const exportBookHandler = (book: Book, services: AppServices) => async() => {
  downloadFile(`${book.title}.csv`, await generateBookPageSpreadsheet(book, services));
};

const notRetiredbooks = () => Object.entries(getBooksConfigSync().books).filter(([, book]) => !book.retired);

const Books = () => {
  const [books, setBooks] = useState<
    Array<[string, BookVersionConfig] | [string, BookVersionConfig, Book]>
  >(notRetiredbooks());
  const services = useServices();
  const {archiveLoader, osWebLoader} = services;

  useEffect(() => {
    const bookLoader = makeUnifiedBookLoader(archiveLoader, osWebLoader, {booksConfig: getBooksConfigSync()});

    for (const [bookId] of notRetiredbooks()) {
      bookLoader(bookId).then((bookData) => {
        setBooks((state) => state.map((data) => data[0] === bookId ? [data[0], data[1], bookData] : data));
      });
    }
  }, [archiveLoader, osWebLoader]);

  function BookLink({id, book}: {id: string, book: Book | undefined}) {
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
            <DropdownItem message='i18n:dev:exportBookPages' onClick={exportBookHandler(book, services)} />
          </DotMenuDropdownList>
        </DotMenuDropdown>
        : null
      }
    </>;
  }

  return <Panel title='Books'>
    <ul style={{paddingBottom: '5rem'}}>
      {books.map(([id, config, book]) => <BookLI key={id}>
        <BookLink id={`${id}@${config.defaultVersion}`} book={book} />
      </BookLI>)}
    </ul>
  </Panel>;
};

export default Books;
