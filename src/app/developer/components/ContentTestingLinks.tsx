import React from 'react';
import { connect } from 'react-redux';
import { BOOKS } from '../../../config';
import { H1 } from '../../components/Typography';
import ContentLink from '../../content/components/ContentLink';
import { ArchiveTreeSection, Book } from '../../content/types';
import { findDefaultBookPage, findTreePages } from '../../content/utils/archiveTreeUtils';
import { getBookPageUrlAndParams } from '../../content/utils/urlUtils';
import withServices from '../../context/Services';
import { AppServices, AppState } from '../../types';
import { assertDefined } from '../../utils';
import Layout from './Layout';
import { makeUnifiedBookLoader } from './utils';

interface Props {
  services: AppServices;
  bookUid: string | undefined;
}
interface State {
  book?: Book;
}

class ContentTestingLinks extends React.Component<Props, State> {
  public state: State = {};

  public async componentDidMount() {
    const {bookUid, services: {archiveLoader, osWebLoader}} = this.props;

    if (!bookUid) {
      throw new Error('bookUid should be defined');
    }

    const bookVersion = assertDefined(BOOKS[bookUid], 'book not configured...').defaultVersion;
    const book = await makeUnifiedBookLoader(archiveLoader, osWebLoader)(bookUid, bookVersion);

    this.setState({book});
  }

  public render() {
    const book = this.state.book;
    return <Layout>
      {book ? this.renderContent(book) : this.renderLoading()}
    </Layout>;
  }

  private renderContent = (book: Book) => {
    return <div>
      <H1>{book.title}</H1>
      <table>
        <thead>
          <tr>
            <th>page title</th>
            <th>rex link</th>
            <th>cnx link</th>
            <th>cnx link for old version</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>no page</td>
            <td>{this.renderRexLink(book, findDefaultBookPage(book))}</td>
            <td>{this.renderCurrentCnxLink(book)}</td>
            <td>{this.renderOldCnxLink(book)}</td>
          </tr>
          {findTreePages(book.tree).map((page) => <tr key={page.id}>
            <td dangerouslySetInnerHTML={{__html: page.title}} />
            <td>{this.renderRexLink(book, page)}</td>
            <td>{this.renderCurrentCnxLink(book, page)}</td>
            <td>{this.renderOldCnxLink(book, page)}</td>
          </tr>)}
        </tbody>

      </table>
    </div>;
  };

  private renderOldCnxLink = (book: Book, page?: ArchiveTreeSection) => {
    const url = page
      ? `https://cnx.org/contents/${book.shortId}@${book.history[2].version}:${page.shortId}`
      : `https://cnx.org/contents/${book.shortId}@${book.history[2].version}`;
    return <a href={url}>{url}</a>;
  };

  private renderCurrentCnxLink = (book: Book, page?: ArchiveTreeSection) => {
    const url = page
      ? `https://cnx.org/contents/${book.shortId}@${book.version}:${page.shortId}`
      : `https://cnx.org/contents/${book.shortId}@${book.version}`;
    return <a href={url}>{url}</a>;
  };

  private renderRexLink = (book: Book, page: ArchiveTreeSection) => {
    const {url} = getBookPageUrlAndParams(book, page);
    return <ContentLink book={book} page={page}>{url}</ContentLink>;
  };

  private renderLoading() {
    return 'loading...';
  }
}

export default connect(
  (state: AppState) => ({
    bookUid: state.navigation.params && state.navigation.params.book,
  })
)(withServices(ContentTestingLinks));
