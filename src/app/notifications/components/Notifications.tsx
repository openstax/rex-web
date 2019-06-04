import React, { SFC } from 'react';
import { connect } from 'react-redux';
import { FlattenSimpleInterpolation } from 'styled-components';
import styled, { css } from 'styled-components/macro';
import { getType } from 'typesafe-actions';
import { contentWrapperMaxWidth } from '../../content/components/constants';
import { disablePrint } from '../../content/components/utils/disablePrint';
import theme from '../../theme';
import { AppState } from '../../types';
import * as actions from '../actions';
import * as select from '../selectors';
import { AnyNotification } from '../types';
import UpdatesAvailable from './UpdatesAvailable';

interface Props extends React.HTMLProps<HTMLDivElement> {
  toastInset?: number;
  inlineBreak?: number;
  notifications: AnyNotification[];
  className?: string;
}

// tslint:disable-next-line:variable-name
const Notifications: SFC<Props> = ({notifications, className, ...props}) => notifications.length === 0
  ? null
  : <div className={className}>
    {notifications.map((notification, index) => {
      switch (notification.type) {
        case getType(actions.updateAvailable): {
          return <UpdatesAvailable key={index} setInlineStyle={setInlineStyle.bind(null, props)} />;
        }
      }
    })}
  </div>;

const connector = connect(
  (state: AppState) => ({
    notifications: select.notifications(state),
  })
);

const notificationWidth = 30;
const getInset = (props: Pick<Props, 'toastInset' | 'inlineBreak'>) => props.toastInset || notificationWidth;

const getInlineBreak = (props: Pick<Props, 'toastInset' | 'inlineBreak'>) => {
  return ((props.inlineBreak || contentWrapperMaxWidth) + notificationWidth * 2) * 10 / 16 + 'em';
};

const setInlineStyle = (props: Pick<Props, 'toastInset' | 'inlineBreak'>, style: FlattenSimpleInterpolation) => css`
  @media (max-width: ${getInlineBreak(props)}) {
    ${style}
  }
`;

/*
 * inline break is designed to occur as soon as notifications would begin to overlap
 * a fixed width container.
 * - pass inlineBreak to set the container size.
 * - pass toastInset to change the float offset of the toast
 */
export default styled(connector(Notifications))`
  width: ${notificationWidth}rem;
  height: 0;
  ${(props) => `margin-left: calc(100% - ${getInset(props)}rem);`}
  top: 0;
  overflow: visible;
  position: sticky;
  padding-top: 1px; /* clear child margin */
  margin-top: -1px; /* clear child margin */

  ${(props) => setInlineStyle(props, css`
    margin-left: 0;
    height: auto;
    width: 100%;
    border-bottom: thin solid ${theme.color.neutral.darkest};
    padding: 0 ${theme.padding.page.desktop}rem;
    background-color: ${theme.color.neutral.base};
    ${theme.breakpoints.mobile(css`
      padding: 0 ${theme.padding.page.mobile}rem;
    `)}
  `)}

  ${disablePrint}
`;
