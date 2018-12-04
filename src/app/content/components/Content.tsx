import React, { Component } from 'react';
import { connect } from 'react-redux';
import Layout from '../../components/Layout';
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

  constructor(props: PropTypes) {
    super(props);
    const {book, page, services} = props;

    if (book) {
      this.state.book = services.archiveLoader.cachedBook(book.shortId);
    }
    if (page && book) {
      this.state.page = services.archiveLoader.cachedPage(book.shortId, page.shortId);
    }
  }

  public loadBook(props: PropTypes) {
    const {book, services} = props;
    if (!book) {
      return;
    }
    this.setState({book: services.archiveLoader.cachedBook(book.shortId)});
  }

  public loadPage(props: PropTypes) {
    const {book, page, services} = props;
    if (!book || !page) {
      return;
    }

    this.setState({page: services.archiveLoader.cachedPage(book.shortId, page.shortId)});
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
    return <Layout>
      {!this.isLoading() && <Wrapper key='content'>
        <Sidebar />
        {this.renderContent()}
      </Wrapper>}
    </Layout>;
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
