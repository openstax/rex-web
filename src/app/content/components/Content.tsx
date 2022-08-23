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
import NudgeStudyTools from './NudgeStudyTools';
import Page from './Page';

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
// const UndoPadding = styled.div`
//   @media screen {
//     overflow: visible;
//     min-height: 100%;
//     display: flex;
//     flex-direction: column;
//   }
// `;

// tslint:disable-next-line:variable-name
const OuterWrapper = styled.div`
  @media screen {
    display: flex;
    flex-direction: column;
    overflow: visible;
  }
`;

/*
 * this layout is a mess for these reasons:
 * - the navs must have the default padding inside their containers so their
 *   backgrounds go to the edge of the window.
 *
 * - the content wrapper must behave the same way as the navs in order to get
 *   the sidebar in the right place to line up with the button in the toolbar.
 *
 * - when the sidebar is closed the white wrapper behaves more or less the same
 *   as the default wrapper, but when the sidebar is open it only needs
 *   padding/margin on the right, because the sidebar already puts the left
 *   side in the right place, and you don't want a gap between the sidebar
 *   and the content.
 *
 * - the whole layout depends on using max-width to resolve when the
 *   margins should and should not be applied, and changing margins
 *   all over the place, all of which means that a disturbing number
 *   of things need to know when the sidebar is open/closed.
 */
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
              {/* <UndoPadding> */}
                <ContentNotifications mobileExpanded={mobileExpanded} />
                <Page />
                <Attribution />
                <Footer />
              {/* </UndoPadding> */}
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
