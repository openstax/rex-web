import React, { Component } from 'react';
import { connect } from 'react-redux';
import Layout from '../../components/Layout';
import withServices from '../../context/Services';
import { AppServices, AppState } from '../../types';
import * as select from '../selectors';
import { State } from '../types';
import ContentPane from './ContentPane';
import Header from './Header';
import Page from './Page';
import Sidebar from './Sidebar';
import Wrapper from './Wrapper';

interface PropTypes {
  page: State['page'];
  book: State['book'];
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
      services.archiveLoader.book(book.id, book.version).page(page.id).cached()
      || services.archiveLoader.book(book.shortId, undefined).page(page.shortId).cached()
    );

    return <ContentPane>
      {this.renderHeader()}
      <Page content={cachedPage ? cachedPage.content : ''} />
    </ContentPane>;
  }

  public render() {
    return <Layout>
      <Wrapper>
        <Sidebar />
        {this.renderContent()}
      </Wrapper>
    </Layout>;
  }
}

export default connect(
  (state: AppState) => ({
    book: select.book(state),
    page: select.page(state),
  })
)(withServices(ContentComponent));
