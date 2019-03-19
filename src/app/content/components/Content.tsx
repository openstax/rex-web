import React from 'react';
import styled from 'styled-components';
import Layout from '../../components/Layout';
import theme from '../../theme';
import Attribution from './Attribution';
import BookBanner from './BookBanner';
import CenteredContent from './CenteredContent';
import ContentPane from './ContentPane';
import Page from './Page';
import Sidebar from './Sidebar';
import Toolbar from './Toolbar';
import Wrapper from './Wrapper';

// tslint:disable-next-line:variable-name
const Background = styled.div`
  overflow: visible; /* so sidebar position: sticky works */
  background-color: ${theme.color.neutral.darker};
  width: 100%;
  min-height: 100%;
`;

// tslint:disable-next-line:variable-name
const Content: React.SFC = () => <Layout>
  <Background>
    <BookBanner/>
    <Toolbar />
    <Wrapper>
      <CenteredContent>
        <Sidebar />
        <ContentPane>
          <Page />
          <Attribution />
        </ContentPane>
      </CenteredContent>
    </Wrapper>
  </Background>
</Layout>;

export default Content;
