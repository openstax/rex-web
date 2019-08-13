import React from 'react';
import { connect } from 'react-redux';
import { H1 } from '../../../components/Typography';
import ContentLink from '../../../content/components/ContentLink';
import { ArchiveTreeSection, Book } from '../../../content/types';
import { makeUnifiedBookLoader } from '../../../content/utils';
import { findArchiveTreeNode, findDefaultBookPage, findTreePages } from '../../../content/utils/archiveTreeUtils';
import { getBookPageUrlAndParams } from '../../../content/utils/urlUtils';
import withServices from '../../../context/Services';
import { AppServices, AppState } from '../../../types';
import Layout from '../../components/Layout';

interface Props {
  services: AppServices;
  book?: Book;
}

interface State {
  oldBook?: Book;
}

class ContentTestingLinks extends React.Component<Props, State> {
  public state: State = {};

  public render() {
    const { book } = this.props;
    return <Layout>
      {book ? this.renderContent(book) : this.renderLoading()}
    </Layout>;
  }

  public async componentWillUpdate(newProps: Props) {
    const {services: {archiveLoader, osWebLoader}} = this.props;
    const bookLoader = makeUnifiedBookLoader(archiveLoader, osWebLoader);

    if (newProps.book && this.props.book !== newProps.book) {
      const oldBook = await bookLoader(newProps.book.id, newProps.book.history[2].version);
      this.setState({oldBook});
    }
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
            <td>{this.renderOldCnxLink(page)}</td>
          </tr>)}
        </tbody>

      </table>
    </div>;
  };

  private renderOldCnxLink = (page?: ArchiveTreeSection) => {
    const { oldBook } = this.state;

    if (!oldBook) {
      return null;
    }

    const oldPage = page && findArchiveTreeNode(oldBook.tree, page.shortId);

    const url = oldPage
      ? `https://cnx.org/contents/${oldBook.shortId}@${oldBook.version}:${oldPage.shortId}`
      : `https://cnx.org/contents/${oldBook.shortId}@${oldBook.version}`;

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
    book: state.developer.book,
  })
)(withServices(ContentTestingLinks));
