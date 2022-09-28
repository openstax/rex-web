import React from 'react';
import { connect } from 'react-redux';
import styled, { css } from 'styled-components/macro';
import Layout from '../../components/Layout';
import ScrollOffset from '../../components/ScrollOffset';
import ErrorBoundary from '../../errors/components/ErrorBoundary';
import Notifications from '../../notifications/components/Notifications';
import theme from '../../theme';
import { AppState } from '../../types';
import HighlightsPopUp from '../highlights/components/HighlightsPopUp';
import KeyboardShortcutsPopup from '../keyboardShortcuts/components/KeyboardShortcutsPopup';
import PracticeQuestionsPopup from '../practiceQuestions/components/PracticeQuestionsPopup';
import { mobileToolbarOpen } from '../search/selectors';
import StudyguidesPopUp from '../studyGuides/components/StudyGuidesPopUp';
import Footer from './../../components/Footer';
import Attribution from './Attribution';
import BookBanner from './BookBanner';
import BuyBook from './BuyBook';
import CenteredContentRow from './CenteredContentRow';
import {
  bookBannerDesktopMiniHeight,
  bookBannerMobileMiniHeight,
  scrollOffset,
  toolbarMobileExpandedHeight,
  topbarDesktopHeight,
  topbarMobileHeight
} from './constants';
import ContentPane from './ContentPane';
import LabsCTA from './LabsCall';
import NudgeStudyTools from './NudgeStudyTools';
import Page from './Page';
import PrevNextBar from './PrevNextBar';

import Navigation from './Navigation';
import Topbar from './Topbar';
import Wrapper from './Wrapper';

// tslint:disable-next-line:variable-name
const Background = styled.div`
  @media screen {
    display: flex;
    flex: 1;
    flex-direction: column;
    overflow: visible; /* so sidebar position: sticky works */
    background-color: ${theme.color.neutral.darker};
  }
`;

// tslint:disable-next-line:variable-name
const ContentNotifications = styled(Notifications)`
  &&& {
    z-index: ${theme.zIndex.contentNotifications};
    top: ${bookBannerDesktopMiniHeight + topbarDesktopHeight}rem;
    ${theme.breakpoints.mobile(css`
      top: ${({mobileExpanded}: {mobileExpanded: boolean}) => mobileExpanded
          ? bookBannerMobileMiniHeight + toolbarMobileExpandedHeight
          : bookBannerMobileMiniHeight + topbarMobileHeight
      }rem;
    `)}
  }
`;

// tslint:disable-next-line:variable-name
const OuterWrapper = styled.div`
  @media screen {
    display: flex;
    flex-direction: column;
    overflow: visible;
  }
`;

// tslint:disable-next-line:variable-name
const Content = ({mobileExpanded}: {mobileExpanded: boolean}) => <Layout>
  <ScrollOffset
    desktopOffset={
      bookBannerDesktopMiniHeight
      + topbarDesktopHeight
      + scrollOffset
    }
    mobileOffset={
      bookBannerMobileMiniHeight
      + (mobileExpanded ? toolbarMobileExpandedHeight : topbarMobileHeight)
      + scrollOffset
    }
  />
  <Background>
    <BookBanner />
    <ErrorBoundary>
      <HighlightsPopUp />
      <KeyboardShortcutsPopup />
      <StudyguidesPopUp />
      <PracticeQuestionsPopup />
      <NudgeStudyTools />
      <OuterWrapper>
        <Topbar />
        <Wrapper>
          <Navigation />
          <CenteredContentRow>
            <ContentPane>
              <ContentNotifications mobileExpanded={mobileExpanded} />
              <Page>
                <PrevNextBar />
                <LabsCTA />
                <BuyBook />
              </Page>
              <Attribution />
              <Footer />
            </ContentPane>
          </CenteredContentRow>
        </Wrapper>
      </OuterWrapper>
    </ErrorBoundary>
  </Background>
</Layout>;

export default connect(
  (state: AppState) => ({
    mobileExpanded: mobileToolbarOpen(state),
  })
)(Content);
