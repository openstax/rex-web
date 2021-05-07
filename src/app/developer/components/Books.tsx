import React from 'react';
import { BOOKS } from '../../../config';
import { H3 } from '../../components/Typography';
import { StyledContentLink } from '../../content/components/ContentLink';
import { Book } from '../../content/types';
import { findDefaultBookPage, makeUnifiedBookLoader } from '../../content/utils';
import withServices from '../../context/Services';
import { AppServices } from '../../types';
import Panel from './Panel';

interface Props {
  services: AppServices;
}
interface State {
  books: Book[];
}

class Books extends React.Component<Props, State> {
  public state: State = {
    books: [],
  };

  public async componentDidMount() {
    const {archiveLoader, osWebLoader} = this.props.services;
    const bookLoader = makeUnifiedBookLoader(archiveLoader, osWebLoader);

    const sortBooks = (bookA: Book, bookB: Book) => {
      if (bookA.title < bookB.title) {
        return -1;
      } else if (bookA.title > bookB.title) {
        return 1;
      }
      return 0;
    };

    for (const [bookId, {defaultVersion}] of Object.entries(BOOKS)) {
      bookLoader(bookId, defaultVersion).then((bookData) => {
        this.setState((state) => ({
          books: [...state.books, bookData].sort(sortBooks),
        }));
      });
    }
  }

  public render() {
    const {books} = this.state;

    return <Panel title='Books'>
      <ul>
        {books.map((book) => <li key={book.id}>
          {this.renderBookLink(book)}
        </li>)}
      </ul>
    </Panel>;
  }

  private renderBookLink(book: Book) {
    const page = findDefaultBookPage(book);
    return <H3><StyledContentLink book={book} page={page}>{book.title}</StyledContentLink></H3>;
  }
}

export default withServices(Books);
