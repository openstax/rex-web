import React from 'react';
import { useIntl } from 'react-intl';
import { connect } from 'react-redux';
import styled, { css } from 'styled-components/macro';
import TocIcon from '../../../assets/TocIcon';
import theme from '../../theme';
import { AppState, Dispatch } from '../../types';
import * as actions from '../actions';
import * as selectors from '../selectors';
import { State } from '../types';
import { toolbarIconColor } from './constants';
import { toolbarIconStyles } from './Toolbar/iconStyles';
import { toolbarDefaultButton, toolbarDefaultText } from './Toolbar/styled';

interface InnerProps {
  isTocOpen: State['tocOpen'];
  message: string;
  onClick: () => void;
  className?: string;
  hideMobileText: boolean;
}
interface MiddleProps {
  isTocOpen: State['tocOpen'];
  openToc: () => void;
  closeToc: () => void;
  hideMobileText: boolean;
}

// tslint:disable-next-line:variable-name
export const ToCButtonText = styled.span<{isToCOpen: boolean}>`
  ${toolbarDefaultText}
  margin: 0;
  padding: 0;
  ${(props) => props.isTocOpen && `
    font-size: 1.8rem;
    line-height: 2.9rem;
  `}
  ${(props) => !props.isTocOpen && theme.breakpoints.mobileMedium(css`
    margin-left: 1.2rem;
  `)}
  ${(props) => props.hideMobileText && theme.breakpoints.mobile(css`
    display: none;
  `)}
`;

// // tslint:disable-next-line: variable-name
// const StyledTocIcon = styled(TocIcon)``;

// tslint:disable-next-line:variable-name
const ToCToolbarButton = styled.button`
  ${toolbarDefaultButton}
  color: ${toolbarIconColor.base};
  border: none;
  padding: 0;
  background: none;
  overflow: visible;
  cursor: pointer;

  :hover {
    color: ${toolbarIconColor.darker};
  }

  > svg {
    ${toolbarIconStyles};
  }

  ${(props) => props.isTocOpen && `
    flex-direction: row;
    justify-content: start;
  `}
`;

// tslint:disable-next-line: variable-name
const ToCButton = styled.button`
  color: ${toolbarIconColor.base};
  border: none;
  padding: 0;
  background: none;
  overflow: visible;
  cursor: pointer;

  :hover {
    color: ${toolbarIconColor.darker};
  }
`;

const closedMessage = 'i18n:toc:toggle:closed';
const openMessage = 'i18n:toc:toggle:opened';

// tslint:disable-next-line:variable-name
export const OpenSidebar: React.SFC<InnerProps> = ({isTocOpen, message, hideMobileText, children, ...props}) =>
  <ToCToolbarButton isTocOpen={isTocOpen} aria-label={useIntl().formatMessage({id: message})} {...props}>
    <TocIcon />
    <ToCButtonText isTocOpen={isTocOpen} hideMobileText={!!hideMobileText}>
      {useIntl().formatMessage({ id: 'i18n:toc:title' })}
    </ToCButtonText>
    {children}
  </ToCToolbarButton>;

// tslint:disable-next-line:variable-name
export const CloseSidebar: React.SFC<InnerProps> = ({isTocOpen, message, hideMobileText, children, ...props}) =>
  <ToCButton isTocOpen={isTocOpen} aria-label={useIntl().formatMessage({id: message})} {...props}>
    {children}
  </ToCButton>;

const connector = connect(
  (state: AppState) => ({
    isTocOpen:  selectors.tocOpen(state),
  }),
  (dispatch: Dispatch) => ({
    closeToc:  () => dispatch(actions.closeToc()),
    openToc: () => dispatch(actions.openToc()),
  })
);

// tslint:disable-next-line:variable-name
const lockControlState = (isTocOpen: boolean, Control: React.ComponentType<InnerProps>) =>
  connector((props: MiddleProps) => <Control
    {...props}
    isTocOpen={isTocOpen}
    data-testid='toc-button'
    message={isTocOpen ? openMessage : closedMessage}
    data-analytics-label={isTocOpen ? 'Click to close the Table of Contents' : 'Click to open the Table of Contents'}
    onClick={isTocOpen ? props.closeToc : props.openToc}
  />);

// tslint:disable-next-line:variable-name
export const OpenSidebarControl = lockControlState(false, OpenSidebar);

// tslint:disable-next-line:variable-name
export const CloseSidebarControl = lockControlState(true, CloseSidebar);
