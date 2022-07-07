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
  contentWrapperMaxWidth,
  scrollOffset,
  sidebarTransitionTime,
  toolbarMobileExpandedHeight,
  topbarDesktopHeight,
  topbarMobileHeight
} from './constants';
import ContentPane from './ContentPane';
import NudgeStudyTools from './NudgeStudyTools';
import Page from './Page';

import Navigation from './Navigation';
import Topbar from './Topbar';
import { isVerticalNavOpenConnector } from './utils/sidebar';
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
const UndoPadding = styled.div`
  @media screen {
    overflow: visible;
    min-height: 100%;
    display: flex;
    flex-direction: column;
  }
`;

// tslint:disable-next-line:variable-name
const MainContentWrapper = isVerticalNavOpenConnector(styled.div`
  @media screen {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: visible;
    transition: max-width ${sidebarTransitionTime}ms;
    width: 100%;
    margin: 0 auto;
    padding-left: 0;
    ${theme.breakpoints.mobile(css`
      padding-left: 0;
      max-width: ${contentWrapperMaxWidth}rem;
    `)}
    ${(props) => (props.isVerticalNavOpen === false) && `
      max-width: ${contentWrapperMaxWidth}rem;
    `}
  }
`);

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
 * - the white background must then have negative margin to undo the default
 *   padding so that it can get to the edge of the screen on small windows.
 *
 * - the white background can't be on the whole wrapper, because it is fixed
 *   width on large screens, and then it wouldn't go to the edge on small ones.
 *
 * - transitioning the white background from full width to fixed width, while
 *   matching the container boundaries of the navbars, is complicated.
 *
 * - the default padding is duplicated inside the white margin for small
 *   screen behavior, but it cant affect the notifications or attribution,
 *   so there is another container for that.
 *
 * - the extra container for the padding inside the white margin can't go away
 *   because it is necessary to hide the overflow of items on the Page, and contain
 *   the margins of the Page, which must be overflow: visible.
 *
 * - when the sidebar is closed the white wrapper behaves more or less the same
 *   as the default wrapper, but when the sidebar is open it only needs
 *   padding/margin on the right, because the sidebar already puts the left
 *   side in the right place, and you don't want a gap between the sidebar
 *   and the content.
 *
 * - a bunch of these containers could be combined, except that then the
 *   transitions break because you're combining things that need to be
 *   fixed with things that need to be animated.
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
              <UndoPadding>
                <MainContentWrapper>
                  <ContentNotifications mobileExpanded={mobileExpanded} />
                  <Page />
                  <Attribution />
                  <Footer />
                </MainContentWrapper>
              </UndoPadding>
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
