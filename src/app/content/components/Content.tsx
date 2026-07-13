import React from 'react';
import { useSelector } from 'react-redux';
import Layout from '../../components/Layout';
import ScrollOffset from '../../components/ScrollOffset';
import ErrorBoundary from '../../errors/components/ErrorBoundary';
import Notifications from '../../notifications/components/Notifications';
import { AppState } from '../../types';
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
import theme from '../../theme';
import './Content.css';

function Content() {
  const mobileExpanded = useSelector((state: AppState) => mobileToolbarOpen(state));
  const book = useSelector((state: AppState) => bookSelector(state));

  // If book hasn't loaded yet, render empty layout to avoid crashing before ErrorBoundary mounts
  if (!book) {
    return <Layout />;
  }

  // Calculate positioning values
  const mobileTop = mobileExpanded
    ? bookBannerMobileMiniHeight + toolbarMobileExpandedHeight
    : bookBannerMobileMiniHeight + topbarMobileHeight;
  const desktopTop = bookBannerDesktopMiniHeight + topbarDesktopHeight;

  return (
    <Layout>
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
      <div className="content-background">
        <BookBanner />
        <ErrorBoundary>
          <ConfirmationToastProvider>
            <HighlightsPopUp />
            <KeyboardShortcutsPopup />
            <StudyguidesPopUp />
            <PracticeQuestionsPopup />
            <NudgeStudyTools />
            <div className="content-outer-wrapper">
              <Wrapper>
                <Navigation />
                <ContentPane>
                  <LoginGate book={book}>
                    <Topbar />
                    <div
                      className="content-notifications-wrapper"
                      style={{
                        '--content-notifications-z-index': theme.zIndex.contentNotifications,
                        '--content-notifications-top-desktop': `${desktopTop}rem`,
                        '--content-notifications-top-mobile': `${mobileTop}rem`,
                      } as React.CSSProperties}
                    >
                      <Notifications className="content-notifications" />
                    </div>
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
              </Wrapper>
            </div>
          </ConfirmationToastProvider>
        </ErrorBoundary>
      </div>
    </Layout>
  );
}

export default Content;
