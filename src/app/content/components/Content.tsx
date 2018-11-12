import React, { Component } from 'react';
import { connect } from 'react-redux';
import { AppState } from '../../types';
import * as select from '../selectors';
import { ArchiveContent, State } from '../types';
import { archiveLoader } from '../utils';
import Page from './Page';

interface PropTypes {
  page: State['page'];
  book: State['book'];
  loading: boolean;
}

interface ReactState {
  book?: ArchiveContent;
  page?: ArchiveContent;
}

class Content extends Component<PropTypes, ReactState> {
  public state: ReactState = {};

  public loadBook(props: PropTypes) {
    if (!props.book) {
      return;
    }
    archiveLoader(props.book.shortId).then((book) => this.setState({book}));
  }

  public loadPage(props: PropTypes) {
    if (!props.book || !props.page) {
      return;
    }
    archiveLoader(`${props.book.shortId}:${props.page.shortId}`).then((page) => this.setState({page}));
  }

  public componentDidMount() {
    this.loadBook(this.props);
    this.loadPage(this.props);
  }

  public componentWillReceiveProps(props: PropTypes) {
    this.loadBook(props);
    this.loadPage(props);
  }

  public renderHeader = () => {
    const {page, book} = this.props as PropTypes;
    return <div>
      {book && page && <h1>{book.title} / {page.title}</h1>}
    </div>;
  }

  public renderContent = () => {
    const {page} = this.state;
    return <div>
      {page && <Page content={page.content} />}
    </div>;
  }

  public render() {
    return <div>
      {this.renderHeader()}
      {this.renderContent()}
    </div>;
  }
}

export default connect(
  (state: AppState) => ({
    book: select.book(state),
    loading: !!select.loadingBook(state) || !!select.loadingPage,
    page: select.page(state),
  })
)(Content);
