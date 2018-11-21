import React, { Component } from 'react';
import { connect } from 'react-redux';
import { AppState } from '../../types';
import * as select from '../selectors';
import { ArchiveContent, State } from '../types';
import { archiveLoader } from '../utils';
import Header from './Header';
import Page from './Page';
import SkipToContent from './SkipToContent';
import Wrapper from './Wrapper';

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

  public componentWillMount() {
    this.loadBook(this.props);
    this.loadPage(this.props);
  }

  public componentWillReceiveProps(props: PropTypes) {
    this.loadBook(props);
    this.loadPage(props);
  }

  public renderSkip = () => {
    return <SkipToContent targetId='main-content'/>;
  }

  public renderHeader = () => {
    const {page, book} = this.props as PropTypes;
    return <div>
      {book && page && <Header>{book.title} / {page.title}</Header>}
    </div>;
  }

  public renderContent = () => {
    const {page} = this.state;
    return page && <Page id='main-content' content={page.content} />;
  }

  public render() {
    if (this.isLoading()) {
      return null;
    }
    return <Wrapper key='content'>
      {this.renderSkip()}
      {this.renderHeader()}
      {this.renderContent()}
    </Wrapper>;
  }

  private isLoading() {
    return this.props.loading || !this.state.book || !this.state.page;
  }
}

export default connect(
  (state: AppState) => ({
    book: select.book(state),
    loading: !!select.loadingBook(state) || !!select.loadingPage(state),
    page: select.page(state),
  })
)(Content);
