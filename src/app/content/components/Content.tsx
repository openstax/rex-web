import React, { Component } from 'react';
import { connect } from 'react-redux';
import withServices from '../../context/Services';
import { AppServices, AppState } from '../../types';
import * as select from '../selectors';
import { ArchiveContent, ArchivePage, State } from '../types';
import ContentPane from './ContentPane';
import Header from './Header';
import Page from './Page';
import Sidebar from './Sidebar';
import Wrapper from './Wrapper';

interface PropTypes {
  page: State['page'];
  book: State['book'];
  loading: boolean;
  services: AppServices;
}

interface ReactState {
  book?: ArchiveContent;
  page?: ArchivePage;
}

export class ContentComponent extends Component<PropTypes, ReactState> {
  public state: ReactState = {};

  public loadBook(props: PropTypes) {
    if (!props.book) {
      return;
    }
    this.props.services.archiveLoader(props.book.shortId).then((book) => this.setState({book}));
  }

  public loadPage(props: PropTypes) {
    if (!props.book || !props.page) {
      return;
    }
    this.props.services
      .archiveLoader(`${props.book.shortId}:${props.page.shortId}`)
      .then((page) => this.setState({page: page as ArchivePage}));
  }

  public componentWillMount() {
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
      {book && page && <Header>{book.title} / {page.title}</Header>}
    </div>;
  }

  public renderContent = () => {
    const {page} = this.state;

    return <ContentPane>
      {this.renderHeader()}
      {page && <Page content={page.content} />}
    </ContentPane>;
  }

  public render() {
    if (this.isLoading()) {
      return null;
    }
    return <Wrapper key='content'>
      <Sidebar />
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
)(withServices(ContentComponent));
