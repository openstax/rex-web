import React from 'react';
import { useIntl } from 'react-intl';
import { connect, useDispatch } from 'react-redux';
import styled, { css } from 'styled-components/macro';
import TocIcon from '../../../assets/TocIcon';
import { textRegularSize } from '../../components/Typography';
import theme from '../../theme';
import { AppState, Dispatch } from '../../types';
import * as actions from '../actions';
import * as selectors from '../selectors';
import { State } from '../types';
import { toolbarIconColor } from './constants';
import { toolbarIconStyles } from './Toolbar/iconStyles';
import { PlainButton, TimesIcon, toolbarDefaultButton, toolbarDefaultText } from './Toolbar/styled';

interface InnerProps {
  isOpen: State['tocOpen'];
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
const ToCButton = styled.button<{isOpen: State['tocOpen'], isActive: boolean }>`
  background: none;
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

  display:
    ${({isOpen, isActive}) => (isOpen !== false && isActive) || (isOpen === false && !isActive)
      ? 'flex'
      : 'none'
  };
  ${(props) => props.isOpen === null && !props.isActive && theme.breakpoints.mobile(css`
    display: flex;
  `)}
  ${(props) => props.isOpen === null && props.isActive && theme.breakpoints.mobile(css`
    display: none;
  `)}
`;

// tslint:disable-next-line: variable-name
const CloseToCButton = styled.button`
  color: ${toolbarIconColor.base};
  border: none;
  padding: 0;
  background: none;
  overflow: visible;
  cursor: pointer;
  display: block;

  :hover {
    color: ${toolbarIconColor.darker};
  }

  ${theme.breakpoints.mobileMedium(css`
    display: none;
  `)}
`;

// tslint:disable-next-line: variable-name
export const CloseToCAndMobileMenuButton = styled((props) => {
  const intl = useIntl();
  const dispatch = useDispatch();

  return <PlainButton
    {...props}
    onClick={() => dispatch(actions.closeMobileMenu())}
    aria-label={intl.formatMessage({ id: 'i18n:toolbar:mobile-menu:close'})}
    >
      <TimesIcon />
  </PlainButton>;
})`
  height: 40px;
  position: absolute;
  right: 0;
  display: none;
  ${theme.breakpoints.mobileMedium(css`
    display: block;
  `)}
`;

// tslint:disable-next-line:variable-name
export const TOCControl = ({ message, children, ...props }: React.PropsWithChildren<InnerProps>) =>
  <ToCButton
    aria-label={useIntl().formatMessage({ id: message })}
    {...props}
  >
    <TocIcon />
    <ToCButtonText>
      {useIntl().formatMessage({ id: 'i18n:toc:title' })}
    </ToCButtonText>
    {children}
  </ToCButton>;

// tslint:disable-next-line:variable-name
export const CloseTOC = ({ message, children, ...props}: React.PropsWithChildren<InnerProps>) =>
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
const lockControlState = (isOpen: boolean, Control: React.ComponentType<InnerProps>) =>
  connector((props: MiddleProps) => <Control
    {...props}
    data-testid='toc-button'
    message={isOpen ? openMessage : closedMessage}
    data-analytics-label={isOpen ? 'Click to close the Table of Contents' : 'Click to open the Table of Contents'}
    onClick={isOpen ? props.closeToc : props.openToc}
    isActive={Boolean(props.showActivatedState) && isOpen}
  />);

// tslint:disable-next-line: variable-name
export const OpenTOCControl = lockControlState(false, TOCControl);

// tslint:disable-next-line: variable-name
export const CloseTOCControl = lockControlState(true, TOCControl);

// tslint:disable-next-line:variable-name
export const TOCCloseButton = (lockControlState(true, CloseTOC));

// tslint:disable-next-line:variable-name
export const TOCBackButton = styled(TOCCloseButton)`
  display: none;
  ${theme.breakpoints.mobileMedium(css`
    display: block;
  `)}
`;

// tslint:disable-next-line: variable-name
export const StyledOpenTOCControl = styled(OpenTOCControl)`
  display: flex;
  padding: 0;
  min-height: unset;
  flex-direction: row;
  justify-content: start;

  ${ToCButtonText} {
    ${textRegularSize};
  }
`;
