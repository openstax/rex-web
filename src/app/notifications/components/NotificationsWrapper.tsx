import React from 'react';
import styled from 'styled-components';
import Notifications from '../../notifications/components/Notifications';
import theme from '../../theme';
import { inlineDisplayBreak } from '../theme';

const notificationWidth = 30;

// tslint:disable-next-line:variable-name
export const ChooseNotification = styled(Notifications)`
    width: ${notificationWidth}rem;
    margin-left: calc(100% - ${notificationWidth}rem);
    overflow: visible;
    position: -webkit-sticky;
    position: fixed;
    padding-top: 1px;
    margin-top: -1px;
    z-index: ${theme.zIndex.contentNotifications};

    @media (max-width: ${inlineDisplayBreak}) {
        box-shadow: inset 0 -0.2rem 0.2rem 0 rgba(0, 0, 0, 0.14);
        background-color: ${theme.color.neutral.darker};
        margin: 0;
        height: auto;
        width: 100%;
        padding: 1rem;
    }
`;

// tslint:disable-next-line:variable-name
export const NotificationsWrapper: React.SFC = () => <ChooseNotification/>;
