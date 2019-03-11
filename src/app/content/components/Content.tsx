import React, { Component } from 'react';
import { connect } from 'react-redux';
import Layout from '../../components/Layout';
import { AppState } from '../../types';
import * as select from '../selectors';
import { State } from '../types';
import BookBanner from './BookBanner';
import ContentPane from './ContentPane';
import Page from './Page';
import Sidebar from './Sidebar';
import Toolbar from './Toolbar';
import Wrapper from './Wrapper';

interface PropTypes {
  page: State['page'];
  book: State['book'];
}

export class ContentComponent extends Component<PropTypes> {

  public render() {
    return <Layout>
      <BookBanner/>
      <Toolbar />
      <Wrapper>
        <Sidebar />
        <ContentPane>
          <Page />
        </ContentPane>
      </Wrapper>
    </Layout>;
  }
}

export default connect(
  (state: AppState) => ({
    book: select.book(state),
    page: select.page(state),
  })
)(ContentComponent);
