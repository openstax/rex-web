import React, { Component } from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';
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
export const ChooseNotification = styled(Notifications)`
    width: ${notificationWidth}rem;
    /* height: 0; */
    margin-left: calc(100% - ${notificationWidth}rem);
    overflow: visible;
    position: -webkit-sticky;
    position: fixed;
    /* padding-top: 1px; */
    /* margin-top: -1px; */
    z-index: ${theme.zIndex.contentNotifications};

    @media (max-width: ${inlineDisplayBreak}) {
        box-shadow: inset 0 -0.2rem 0.2rem 0 rgba(0, 0, 0, 0.14);
        background-color: ${theme.color.neutral.darker};
        margin: 0;
        height: auto;
        width: 100%;
    }
`;

// tslint:disable-next-line:variable-name
export const Wrapper = styled.div`
  width: ${notificationWidth}rem;
  height: 0;
  margin-left: calc(100% - ${notificationWidth}rem);
  top: 0;
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
`;

export class NotificationsWrapper extends Component<Props> {
    public render() {
        return <ChooseNotification mobileExpanded={this.props.mobileExpanded} />;
    }
}

export default connect(
    (state: AppState) => ({
      notifications: select.notificationsForDisplay(state),
    })
)(Notifications);
