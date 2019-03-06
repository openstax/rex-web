import React from 'react';
import { BOOKS } from '../../../config';
import { ArchiveTree } from '../../content/types';
import withServices from '../../context/Services';
import { AppServices } from '../../types';

interface Props {
  services: AppServices;
}
interface State {
  books: Array<{
    title: string;
    tree: ArchiveTree;
    slug: string;
  }>;
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
      const bookSlug = await osWebLoader.getBookSlugFromId(bookId);
      const book = await bookLoader.load();

      books.push({
        slug: bookSlug,
        title: book.title,
        tree: book.tree,
      });
    }

    this.setState({books});
  }

  public render() {
    const {books} = this.state;

    return <div>
      <h2>REX Books</h2>
      {books.map((book) => <div key={book.slug}>
        <h2>{book.title}</h2>
      </div>)}
    </div>;
  }
}

export default withServices(Books);
