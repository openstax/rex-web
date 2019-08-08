import React from 'react';
import { connect } from 'react-redux';
import { H1 } from '../../../components/Typography';
import { Book } from '../../../content/types';
import { makeUnifiedBookLoader } from '../../../content/utils';
import { archiveTreeContainsNode, findTreePages } from '../../../content/utils/archiveTreeUtils';
import withServices from '../../../context/Services';
import { AppServices, AppState } from '../../../types';
import Layout from '../../components/Layout';

interface Props {
  services: AppServices;
  book?: Book;
}
interface State {
  done: boolean;
  issues: string[];
}

class Audit extends React.Component<Props, State> {
  public state = {
    done: false,
    issues: [],
  };

  public componentDidMount() {
    if (this.props.book) {
      this.checkHistory(this.props.book);
    }
  }

  public componentWillUpdate(newProps: Props) {
    if (!this.props.book && newProps.book) {
      this.checkHistory(newProps.book);
    }
  }

  // TODO - also check page titles
  // TODO - cancel when component unmounts
  public checkHistory = async(book: Book) => {
    const {services: {archiveLoader, osWebLoader}} = this.props;
    const bookLoader = makeUnifiedBookLoader(archiveLoader, osWebLoader);

    for (const history of book.history) {
      const oldBook = await bookLoader(book.id, history.version)
        .catch(() => null);

      if (!oldBook) {
        this.addIssue(`book ${book.id} has old version (${history.version}) that failed to load`);
        continue;
      }

      if (!oldBook.tree) {
        this.addIssue(`book ${book.id} has old tree (${oldBook.version}) that is null`);
        continue;
      }

      for (const page of findTreePages(oldBook.tree)) {
        if (!archiveTreeContainsNode(book.tree, page.id)) {
          this.addIssue(
            `book ${book.id} has old tree (${oldBook.version}) with page (${page.id}) not found in current version`
          );
        }
      }
    }

    this.setState({done: true});
  };

  public render() {
    const { book } = this.props;
    return <Layout>
      {book ? this.renderContent(book) : this.renderLoading()}
    </Layout>;
  }

  private addIssue = (issue: string) => {
    this.setState({issues: [...this.state.issues, issue]});
  };

  private renderContent = (book: Book) => {
    return <div>
      <H1>{book.title}</H1>
      {!this.state.done && 'loading...'}
      {this.state.issues.map((issue, index) => <p key={index}>{issue}</p>)}
    </div>;
  };

  private renderLoading() {
    return 'loading...';
  }
}

export default connect(
  (state: AppState) => ({
    book: state.developer.book,
  })
)(withServices(Audit));
