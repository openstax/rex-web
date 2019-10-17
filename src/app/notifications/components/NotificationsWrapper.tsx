import React, { Component } from 'react';
import { connect } from 'react-redux';
import styled, { css } from 'styled-components';
import {
    bookBannerDesktopMiniHeight,
    bookBannerMobileMiniHeight,
    toolbarDesktopHeight,
    toolbarMobileExpandedHeight,
    toolbarMobileHeight
} from '../../content/components/constants';
import { disablePrint } from '../../content/components/utils/disablePrint';
import Notifications from '../../notifications/components/Notifications';
import theme from '../../theme';
import { AppState } from '../../types';
import * as select from '../selectors';
import { inlineDisplayBreak } from '../theme';

interface Props {
  mobileExpanded?: boolean;
}

const notificationWidth = 30;

// tslint:disable-next-line:variable-name
export const Wrapper = styled.div`
  width: ${notificationWidth}rem;
  height: 0;
  margin-left: calc(100% - ${notificationWidth}rem);
  /*top: 0;*/
  overflow: visible;
  position: sticky;
  padding-top: 1px; /* clear child margin */
  margin-top: -1px; /* clear child margin */

  @media (max-width: ${inlineDisplayBreak}) {
    box-shadow: inset 0 -0.2rem 0.2rem 0 rgba(0, 0, 0, 0.14);
    background-color: ${theme.color.neutral.darker};
    margin: 0;
    height: auto;
    width: 100%;
  }

  z-index: ${theme.zIndex.contentNotifications};
  top: ${bookBannerDesktopMiniHeight + toolbarDesktopHeight}rem;
  ${theme.breakpoints.mobile(css`
    top: ${({mobileExpanded}: {mobileExpanded: boolean}) => mobileExpanded
        ? bookBannerMobileMiniHeight + toolbarMobileExpandedHeight
        : bookBannerMobileMiniHeight + toolbarMobileHeight
    }rem;
  `)}

  ${disablePrint}
`;

// tslint:disable-next-line:variable-name
const ContentNotifications = styled(Notifications)`
  z-index: ${theme.zIndex.contentNotifications};
  top: ${bookBannerDesktopMiniHeight + toolbarDesktopHeight}rem;
  ${theme.breakpoints.mobile(css`
    top: ${({mobileExpanded}: {mobileExpanded: boolean}) => mobileExpanded
        ? bookBannerMobileMiniHeight + toolbarMobileExpandedHeight
        : bookBannerMobileMiniHeight + toolbarMobileHeight
    }rem;
  `)}
`;

export class NotificationsWrapper extends Component<Props> {
    public render() {
        return <Wrapper>
                <ContentNotifications
                    mobileExpanded={this.props.mobileExpanded}/>
            </Wrapper>;
    }
}

export default connect(
    (state: AppState) => ({
      notifications: select.notificationsForDisplay(state),
    })
)(Notifications);
