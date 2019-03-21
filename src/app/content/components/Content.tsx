import React from 'react';
import styled from 'styled-components';
import Layout from '../../components/Layout';
import { navDesktopHeight } from '../../components/NavBar';
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
  top: ${bookBannerDesktopHeight + toolbarDesktopHeight + navDesktopHeight}rem;

  @media (max-width: ${inlineDisplayBreak}) {
    top: ${bookBannerDesktopHeight + toolbarDesktopHeight}rem;
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
  overflow: visible;
`;

export const mainContentBackground = '#fdfdfd';
// tslint:disable-next-line:variable-name
const MainContentWrapper = styled(CenteredContent)`
  background-color: ${mainContentBackground};
`;

// tslint:disable-next-line:variable-name
const HideOverflowAndRedoPadding = styled.div`
  ${wrapperPadding}
`;

// tslint:disable-next-line:variable-name
const Content: React.SFC = () => <Layout>
  <Background>
    <BookBanner/>
    <Toolbar />
    <Wrapper>
      <CenteredContentRow>
        <Sidebar />
        <ContentPane>
          <UndoPaddingForContent>
            <MainContentWrapper>
              <ContentNotifications />
              <HideOverflowAndRedoPadding>
                <Page />
              </HideOverflowAndRedoPadding>
              <Attribution />
            </MainContentWrapper>
          </UndoPaddingForContent>
        </ContentPane>
      </CenteredContentRow>
    </Wrapper>
  </Background>
</Layout>;

export default Content;
