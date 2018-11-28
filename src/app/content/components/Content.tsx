import React, { Component } from 'react';
import { connect } from 'react-redux';
import Layout from '../../components/Layout';
import withServices from '../../context/Services';
import { AppServices, AppState } from '../../types';
import * as select from '../selectors';
import { ArchiveContent, State } from '../types';
import Header from './Header';
import Page from './Page';
import Wrapper from './Wrapper';

interface PropTypes {
  page: State['page'];
  book: State['book'];
  loading: boolean;
  services: AppServices;
}

interface ReactState {
  book?: ArchiveContent;
  page?: ArchiveContent;
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
      .archiveLoader(`${props.book.shortId}:${props.page.shortId}`).then((page) => this.setState({page}));
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
    return page && <Page content={page.content} />;
  }

  public render() {
    return <Layout>
      {!this.isLoading() && <Wrapper key='content'>
        {this.renderHeader()}
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
