import React from 'react';
import styled from 'styled-components';
import Layout from '../../components/Layout';
import Notifications from '../../notifications/components/Notifications';
import { inlineDisplayBreak } from '../../notifications/theme';
import theme from '../../theme';
import Attribution from './Attribution';
import BookBanner from './BookBanner';
import { bookBannerDesktopHeight } from './BookBanner';
import CenteredContent from './CenteredContent';
import ContentPane from './ContentPane';
import Page from './Page';
import Sidebar from './Sidebar';
import Toolbar from './Toolbar';
import { toolbarDesktopHeight } from './Toolbar';
import Wrapper from './Wrapper';
import { UndoPadding, wrapperPadding } from './Wrapper';

// tslint:disable-next-line:variable-name
const Background = styled.div`
  overflow: visible; /* so sidebar position: sticky works */
  background-color: ${theme.color.neutral.darker};
  width: 100%;
  min-height: 100%;
`;

// tslint:disable-next-line:variable-name
const ContentNotifications = styled(Notifications)`
  top: ${bookBannerDesktopHeight + toolbarDesktopHeight}rem;

  @media (max-width: ${inlineDisplayBreak}) {
    ${wrapperPadding}
  }
`;

// tslint:disable-next-line:variable-name
const CenteredContentRow = styled(CenteredContent)`
  min-height: 100%;
  display: flex;
  flex-direction: row;
`;

// tslint:disable-next-line:variable-name
const UndoPaddingForContent = styled(UndoPadding)`
  flex: 1;
  overflow: visible;
`;

// tslint:disable-next-line:variable-name
const MainContentWrapper = styled(CenteredContent)`
  background-color: ${theme.color.neutral.base};
`;

// tslint:disable-next-line:variable-name
const HideOverflowAndRedoPadding = styled.div`
  ${wrapperPadding}
  overflow: hidden;
`;

// tslint:disable-next-line:variable-name
const Content: React.SFC = () => <Layout>
  <Background>
    <BookBanner/>
    <Toolbar />
    <Wrapper>
      <CenteredContentRow>
        <Sidebar />
        <UndoPaddingForContent>
          <ContentPane>
            <MainContentWrapper>
              <ContentNotifications />
              <HideOverflowAndRedoPadding>
                <Page />
              </HideOverflowAndRedoPadding>
              <Attribution />
            </MainContentWrapper>
          </ContentPane>
        </UndoPaddingForContent>
      </CenteredContentRow>
    </Wrapper>
  </Background>
</Layout>;

export default Content;
