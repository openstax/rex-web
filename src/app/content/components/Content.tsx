import React, { Component } from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';
import Layout from '../../components/Layout';
import withServices from '../../context/Services';
import theme from '../../theme';
import { AppServices, AppState } from '../../types';
import * as select from '../selectors';
import { State } from '../types';
import Attribution from './Attribution';
import ContentPane from './ContentPane';
import Page from './Page';
import Sidebar from './Sidebar';
import SidebarControl from './SidebarControl';
import Wrapper from './Wrapper';

interface PropTypes {
  page: State['page'];
  book: State['book'];
  services: AppServices;
}

// tslint:disable-next-line:variable-name
const Background = styled.div`
  overflow: visible; /* so sidebar position: sticky works */
  background-color: ${theme.color.neutral.darker};
  width: 100%;
  min-height: 100%;
`;

export class ContentComponent extends Component<PropTypes> {

  public render() {
    return <Layout>
      <Background>
        <Wrapper>
          <Sidebar />
          <ContentPane>
            <SidebarControl />
            <Page />
            <Attribution />
          </ContentPane>
        </Wrapper>
      </Background>
    </Layout>;
  }
}

export default connect(
  (state: AppState) => ({
    book: select.book(state),
    page: select.page(state),
  })
)(withServices(ContentComponent));
