import flow from 'lodash/fp/flow';
import React from 'react';
import { connect } from 'react-redux';
import { BOOKS } from '../../../config';
import Button from '../../components/Button';
import { ButtonGroup } from '../../components/Button';
import ContentLink from '../../content/components/ContentLink';
import { Book } from '../../content/types';
import { findDefaultBookPage } from '../../content/utils';
import withServices from '../../context/Services';
import { push } from '../../navigation/actions';
import { AppServices, Dispatch } from '../../types';
import { contentTestingLinks } from '../routes';
import Panel from './Panel';
import { getBooks } from './utils';

interface Props {
  services: AppServices;
  navigate: typeof push;
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
    const books: State['books'] = await getBooks(archiveLoader, osWebLoader, bookEntries);

    this.setState({books});
  }

  public render() {
    const {books} = this.state;

    return <Panel title='Books'>
      <table>
        <thead>
          <tr>
            <th>title</th>
            <th>id</th>
            <th>version</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {books.map((book) => <tr key={book.id}>
            <td>{book.title}</td>
            <td>{book.id}</td>
            <td>{book.version}</td>
            <td>
              <ButtonGroup>
                <Button
                  variant='primary'
                  component={this.renderBookLink(book)}
                />
                <Button
                  component={this.contentTestingLink(book)}
                />
              </ButtonGroup>
            </td>
          </tr>)}
        </tbody>
      </table>
    </Panel>;
  }

  private renderBookLink(book: Book) {
    const page = findDefaultBookPage(book);
    return <ContentLink book={book} page={page}>Open</ContentLink>;
  }

  private contentTestingLink(book: Book) {

    return <a
      href={contentTestingLinks.getUrl({book: book.id})}
      onClick={(e) => {
        if (e.metaKey) {
          return;
        }
        e.preventDefault();
        this.props.navigate({
          params: {book: book.id},
          route: contentTestingLinks,
        });

      }}
    >content testing links</a>;
  }
}

export default connect(
  () => ({
  }),
  (dispatch: Dispatch) => ({
    navigate: flow(push, dispatch),
  })
)(withServices(Books));
