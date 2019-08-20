import { InfoResults } from '@openstax/open-search-client';
import flow from 'lodash/fp/flow';
import React from 'react';
import { connect } from 'react-redux';
import Button from '../../components/Button';
import { ButtonGroup } from '../../components/Button';
import RouteLink from '../../components/RouteLink';
import ContentLink from '../../content/components/ContentLink';
import { getIndexData } from '../../content/search/utils';
import { Book } from '../../content/types';
import { findDefaultBookPage } from '../../content/utils';
import { push } from '../../navigation/actions';
import { AppState, Dispatch } from '../../types';
import { bookTools } from '../routes';
import Panel from './Panel';

interface Props {
  searchInfo?: InfoResults;
  navigate: typeof push;
  books: Book[];
}

class Books extends React.Component<Props> {

  public render() {
    const {books} = this.props;

    return <Panel title='Books'>
      <table>
        <thead>
          <tr>
            <th>title</th>
            <th>id</th>
            <th>version</th>
            <th>search status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {books.map((book) => <tr key={book.id}>
            <td>{book.title}</td>
            <td>{book.id}</td>
            <td>{book.version}</td>
            <td>{
              this.searchHealthIsReady()
                ?  this.searchHealthIsGood(book) ? 'good' : 'bad'
                : '...'
              }
            </td>
            <td>
              <ButtonGroup>
                <Button
                  variant='primary'
                  component={this.renderBookLink(book)}
                />
                <Button
                  component={this.toolsLink(book)}
                />
              </ButtonGroup>
            </td>
          </tr>)}
        </tbody>
      </table>
    </Panel>;
  }

  private searchHealthIsReady = () => this.props.searchInfo && this.props.searchInfo.bookIndexes;

  private searchHealthIsGood = (book: Book) => this.props.searchInfo && this.props.searchInfo.bookIndexes
    && !!this.props.searchInfo.bookIndexes.find(
      (index) => {
        const {bookId, version} = getIndexData(index.id);
        return bookId === book.id && version === book.version;
      }
    )
  ;

  private renderBookLink(book: Book) {
    const page = findDefaultBookPage(book);
    return <ContentLink book={book} page={page}>Open</ContentLink>;
  }

  private toolsLink(book: Book) {
    return <Button
      component={<RouteLink match={{
        params: {book: book.id},
        route: bookTools,
      }}>tools</RouteLink>}
    />;
  }
}

export default connect(
  (state: AppState) => ({
    books: state.developer.books,
    searchInfo: state.developer.searchInfo,
  }),
  (dispatch: Dispatch) => ({
    navigate: flow(push, dispatch),
  })
)(Books);
