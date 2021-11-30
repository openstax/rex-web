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
  message: string;
  onClick: () => void;
  className?: string;
  isActive?: boolean | null;
}

interface MiddleProps {
  isOpen: State['tocOpen'];
  openToc: () => void;
  closeToc: () => void;
  showActivatedState?: boolean;
}

const closedMessage = 'i18n:toc:toggle:closed';
const openMessage = 'i18n:toc:toggle:opened';

// tslint:disable-next-line:variable-name
export const ToCButtonText = styled.span`
  ${toolbarDefaultText}
  margin: 0;
  padding: 0;
`;

// tslint:disable-next-line:variable-name
const ToCButton = styled.button`
  background: none;
  ${(props: { isActive: boolean | null}) => props.isActive === null && `
    background-color: rgba(0,0,0,0.1);
  `}
  ${(props: { isActive: boolean | null}) => props.isActive === null && theme.breakpoints.mobile(css`
    background: none;
  `)}
  ${toolbarDefaultButton}
  color: ${toolbarIconColor.base};
  border: none;
  padding: 0 10px;
  overflow: visible;
  cursor: pointer;

  :hover {
    color: ${toolbarIconColor.darker};
  }

  > svg {
    ${toolbarIconStyles};
  }
`;

// tslint:disable-next-line: variable-name
const CloseToCButton = styled.button`
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

// tslint:disable-next-line:variable-name
export const SidebarControl = ({ message, children, ...props }: React.PropsWithChildren<InnerProps>) => {
  return <ToCButton
    aria-label={useIntl().formatMessage({ id: message })}
    {...props}
  >
    <TocIcon />
    <ToCButtonText>
      {useIntl().formatMessage({ id: 'i18n:toc:title' })}
    </ToCButtonText>
    {children}
  </ToCButton>;
  };

// tslint:disable-next-line:variable-name
export const CloseSidebar = ({ message, children, ...props}: React.PropsWithChildren<InnerProps>) =>
  <CloseToCButton
    aria-label={useIntl().formatMessage({ id: message })}
    {...props}
  >
    {children}
  </CloseToCButton>;

const connector = connect(
  (state: AppState) => ({
    isOpen:  selectors.tocOpen(state),
  }),
  (dispatch: Dispatch) => ({
    closeToc:  () => dispatch(actions.closeToc()),
    openToc: () => dispatch(actions.openToc()),
  })
);

// tslint:disable-next-line:variable-name
const lockControlState = (Control: React.ComponentType<InnerProps>, forcedIsOpen: boolean | null = null, ) =>
  connector((props: MiddleProps) => {
  const isToCOpened = forcedIsOpen !== null ? forcedIsOpen : props.isOpen;

  return <Control
    {...props}
    data-testid='toc-button'
    message={isToCOpened ? openMessage : closedMessage}
    data-analytics-label={isToCOpened ? 'Click to close the Table of Contents' : 'Click to open the Table of Contents'}
    onClick={isToCOpened ? props.closeToc : props.openToc}
    isActive={Boolean(props.showActivatedState) && isToCOpened}
  />;
});

// tslint:disable-next-line:variable-name
export const ToggleSidebarControl = lockControlState(SidebarControl);

// tslint:disable-next-line:variable-name
export const CloseSidebarControl = lockControlState(CloseSidebar, true);

// tslint:disable-next-line: variable-name
export const OpenSidebarControl = lockControlState(SidebarControl, false);
