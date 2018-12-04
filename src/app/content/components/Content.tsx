import React, { Component } from 'react';
import { connect } from 'react-redux';
import Layout from '../../components/Layout';
import withServices from '../../context/Services';
import { AppServices, AppState } from '../../types';
import * as select from '../selectors';
import { State } from '../types';
import Header from './Header';
import Page from './Page';
import Wrapper from './Wrapper';

interface PropTypes {
  page: State['page'];
  book: State['book'];
  loading: boolean;
  services: AppServices;
}

export class ContentComponent extends Component<PropTypes> {

  public renderHeader = () => {
    const {page, book} = this.props as PropTypes;
    return <div>
      {book && page && <Header>{book.title} / {page.title}</Header>}
    </div>;
  }

  public renderContent = () => {
    const {book, page, services} = this.props;

    const cachedPage = book && page && (
      services.archiveLoader.cachedPage(`${book.id}@${book.version}`, page.id)
      || services.archiveLoader.cachedPage(book.shortId, page.shortId)
    );

    return <Page content={cachedPage ? cachedPage.content : ''} />;
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
    return this.props.loading;
  }
}

export default connect(
  (state: AppState) => ({
    book: select.book(state),
    loading: !!select.loadingBook(state) || !!select.loadingPage(state) || !select.book(state) || !select.page(state),
    page: select.page(state),
  })
)(withServices(ContentComponent));
