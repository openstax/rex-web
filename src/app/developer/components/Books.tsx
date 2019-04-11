import React from 'react';
import { BOOKS } from '../../../config';
import { H3 } from '../../components/Typography';
import { StyledContentLink } from '../../content/components/ContentLink';
import { Book } from '../../content/types';
import { findDefaultBookPage, formatBookData } from '../../content/utils';
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

    const bookEntries = Object.entries(BOOKS);

    const books: State['books'] = [];

    for (const [bookId, {defaultVersion}] of bookEntries) {
      const bookLoader = archiveLoader.book(bookId, defaultVersion);
      const osWebBook = await osWebLoader.getBookFromId(bookId);
      const archiveBook = await bookLoader.load();

      books.push(formatBookData(archiveBook, osWebBook));
    }

    this.setState({books});
  }

  public render() {
    const {books} = this.state;

    return <Panel title='Books'>
      <div id='books-list'>
        {books.map((book) => <div key={book.slug}>
          {this.renderBookLink(book)}
        </div>)}
      </div>
    </Panel>;
  }

  private renderBookLink(book: Book) {
    const page = findDefaultBookPage(book);
    return <H3><StyledContentLink book={book} page={page} data-slug={book.slug}>{book.title}</StyledContentLink></H3>;
  }
}

export default withServices(Books);
