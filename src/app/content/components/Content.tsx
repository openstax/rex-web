import React from 'react';
import { connect } from 'react-redux';
import styled, { AnyStyledComponent, css } from 'styled-components/macro';
import Layout from '../../components/Layout';
import ScrollOffset from '../../components/ScrollOffset';
import ErrorBoundary from '../../errors/components/ErrorBoundary';
import Notifications from '../../notifications/components/Notifications';
import theme from '../../theme';
import { AppState } from '../../types';
import { Book } from '../types';
import HighlightsPopUp from '../highlights/components/HighlightsPopUp';
import KeyboardShortcutsPopup from '../keyboardShortcuts/components/KeyboardShortcutsPopup';
import PracticeQuestionsPopup from '../practiceQuestions/components/PracticeQuestionsPopup';
import { mobileToolbarOpen } from '../search/selectors';
import { book as bookSelector } from '../selectors';
import StudyguidesPopUp from '../studyGuides/components/StudyGuidesPopUp';
import Footer from './../../components/Footer';
import Attribution from './Attribution';
import BookBanner from './BookBanner';
import BuyBook from './BuyBook';
import {
  bookBannerDesktopMiniHeight,
  bookBannerMobileMiniHeight,
  scrollOffset,
  toolbarMobileExpandedHeight,
  topbarDesktopHeight,
  topbarMobileHeight,
} from './constants';
import ContentPane from './ContentPane';
import ContentWarning from './ContentWarning';
import LoginGate from './LoginGate';
import LabsCTA from './LabsCall';
import NudgeStudyTools from './NudgeStudyTools';
import Page from './Page';
import PrevNextBar from './PrevNextBar';

import Navigation from './Navigation';
import Topbar from './Topbar';
import { ConfirmationToastProvider } from './ConfirmationToast';
import Wrapper from './Wrapper';

const Background = styled.div`
  @media screen {
    display: flex;
    flex: 1;
    flex-direction: column;
    overflow: visible; /* so sidebar position: sticky works */
    background-color: ${theme.color.neutral.darker};
  }
`;

const ContentNotifications = styled(Notifications as AnyStyledComponent)`
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

const OuterWrapper = styled.div`
  @media screen {
    display: flex;
    flex-direction: column;
    overflow: visible;
  }
`;


const Content = ({mobileExpanded, book}: {mobileExpanded: boolean; book: Book}) => <Layout>
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
        <Wrapper>
          <ConfirmationToastProvider>
            <Navigation />
            <ContentPane>
              <LoginGate book={book}>
                <Topbar />
                <ContentNotifications mobileExpanded={mobileExpanded} />
                <ContentWarning book={book} />
                <Page>
                  <PrevNextBar />
                  <LabsCTA />
                  <BuyBook book={book} />
                </Page>
              </LoginGate>
              <Attribution />
              <Footer />
            </ContentPane>
          </ConfirmationToastProvider>
        </Wrapper>
      </OuterWrapper>
    </ErrorBoundary>
  </Background>
</Layout>;

export default connect(
  (state: AppState) => ({
    mobileExpanded: mobileToolbarOpen(state),
    book: bookSelector(state),
  })
)(Content);
