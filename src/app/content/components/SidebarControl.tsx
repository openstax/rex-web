import React from 'react';
import { useIntl } from 'react-intl';
import { connect, useDispatch } from 'react-redux';
import styled, { css } from 'styled-components/macro';
import SearchIcon from '../../../assets/SearchIcon';
import TocIcon from '../../../assets/TocIcon';
import { textRegularSize } from '../../components/Typography';
import theme from '../../theme';
import { AppState, Dispatch } from '../../types';
import * as actions from '../actions';
import * as searchActions from '../search/actions';
import * as searchSelectors from '../search/selectors';
import * as selectors from '../selectors';
import { toolbarIconColor } from './constants';
import { toolbarIconStyles } from './Toolbar/iconStyles';
import { PlainButton, TimesIcon, toolbarDefaultButton, toolbarDefaultText } from './Toolbar/styled';

interface InnerProps {
  isOpen: boolean | null;
  message: string;
  onClick: () => void;
  className?: string;
  isActive?: boolean | null;
}

interface MiddleProps {
  isOpen: boolean | null;
  open: () => void;
  close: () => void;
  showActivatedState?: boolean;
}

const closedTocMessage = 'i18n:toc:toggle:closed';
const openTocMessage = 'i18n:toc:toggle:opened';
const closedSearchMessage = 'i18n:toolbar:search:toggle:closed';
const openSearchMessage = 'i18n:toolbar:search:toggle:opened';

// tslint:disable-next-line:variable-name
export const ButtonText = styled.span`
  ${toolbarDefaultText}
  margin: 0;
  padding: 0;
`;

// tslint:disable-next-line:variable-name
const OpenButton = styled.button<{isOpen: InnerProps['isOpen'], isActive: boolean }>`
  background: none;
  ${toolbarDefaultButton}
  color: ${toolbarIconColor.base};
  border: none;
  padding: 0;
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

  ${(props) => props.hideMobile && theme.breakpoints.mobileMedium(css`
    display: none;
  `)}
`;

// tslint:disable-next-line: variable-name
const CloseButton = styled.button`
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
    onClick={() => {
      dispatch(actions.closeMobileMenu());
      dispatch(actions.resetToc());
    }}
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
const TOCControl = ({ message, children, ...props }: React.PropsWithChildren<InnerProps>) =>
  <OpenButton
    aria-label={useIntl().formatMessage({ id: message })}
    {...props}
  >
    <TocIcon />
    <ButtonText>
      {useIntl().formatMessage({ id: 'i18n:toolbar:toc:text' })}
    </ButtonText>
    {children}
  </OpenButton>;

// tslint:disable-next-line:variable-name
export const CloseTOC = ({ message, children, ...props}: React.PropsWithChildren<InnerProps>) =>
  <CloseButton
    aria-label={useIntl().formatMessage({ id: message })}
    {...props}
  >
    {children}
  </CloseButton>;

// tslint:disable-next-line:variable-name
export const SearchControl = ({ message, children, ...props }: React.PropsWithChildren<InnerProps>) =>
  <OpenButton
    aria-label={useIntl().formatMessage({ id: message })}
    hideMobile={true}
    {...props}
  >
    <SearchIcon />
    <ButtonText>
      {useIntl().formatMessage({ id: 'i18n:toolbar:search:text' })}
    </ButtonText>
    {children}
  </OpenButton>;

const tocConnector = connect(
  (state: AppState) => ({
    isOpen:  selectors.tocOpen(state),
  }),
  (dispatch: Dispatch) => ({
    close: () => dispatch(actions.closeToc()),
    open: () => dispatch(actions.openToc()),
  })
);

const searchConnector = connect(
  (state: AppState) => ({
    hasQuery: !!searchSelectors.query(state),
    isOpen:  searchSelectors.searchResultsOpen(state),
  }),
  (dispatch: Dispatch) => ({
    close: () => dispatch(searchActions.clearSearch()),
    open: () => {
      dispatch(actions.closeToc());
      dispatch(searchActions.openSearchInSidebar());
    },
  })
);

// tslint:disable-next-line:variable-name
const lockTocControlState = (isOpen: boolean, Control: React.ComponentType<InnerProps>) =>
  tocConnector(({open, close, ...props}: MiddleProps) => <Control
    {...props}
    data-testid='toc-button'
    message={isOpen ? openTocMessage : closedTocMessage}
    data-analytics-label={isOpen ? 'Click to close the Table of Contents' : 'Click to open the Table of Contents'}
    onClick={isOpen ? close : open}
    isActive={Boolean(props.showActivatedState) && isOpen}
  />);

// Search in sidebar experiment
// tslint:disable-next-line:variable-name
const lockSearchControlState = (isOpen: boolean, Control: React.ComponentType<InnerProps>) =>
  searchConnector(styled(({ open, close, hasQuery, desktop = false, ...props }: MiddleProps & {
    desktop?: boolean;
    hasQuery: boolean;
  }) => <Control
    {...props}
    data-testid={`${desktop ? 'desktop' : 'mobile'}-search-button`}
    message={isOpen ? openSearchMessage : closedSearchMessage}
    data-analytics-label={isOpen ? 'Click to close Search' : 'Click to open Search'}
    onClick={(desktop && hasQuery) || isOpen ? close : open}
    isOpen={desktop ? hasQuery || props.isOpen : props.isOpen}
    isActive={Boolean(props.showActivatedState) && isOpen}
  />)`
  ${({ desktop }: { desktop: boolean }) => !desktop && theme.breakpoints.desktop(css`
    display: none;
  `)}
  ${({ desktop }: { desktop: boolean }) => desktop && theme.breakpoints.mobile(css`
    display: none;
  `)}
`);

// tslint:disable-next-line: variable-name
export const TOCControlButton = tocConnector(({open, close, isOpen, ...props}: MiddleProps) => {
  // tslint:disable-next-line: variable-name
  const Tag = isOpen ? OpenButton : CloseButton;

  return (
    <Tag
      {...props}
      data-testid='toc-button'
      aria-label={useIntl().formatMessage({ id: 'i18n:toolbar:toc:text' })}
      aria-expanded={isOpen === true}
      aria-controls='toc-sidebar'
      data-analytics-label={`Click to ${isOpen ? 'close' : 'open'} the Table of Contents`}
      onClick={isOpen ? close : open}
      isOpen={null}
      isActive={Boolean(props.showActivatedState) && isOpen === true}
    >
      <TocIcon />
      <ButtonText>
        {useIntl().formatMessage({ id: 'i18n:toolbar:toc:text' })}
      </ButtonText>
    </Tag>
  );
});

// tslint:disable-next-line:variable-name
export const TOCCloseButton = (lockTocControlState(true, CloseTOC));

// tslint:disable-next-line:variable-name
export const TOCBackButton = styled(TOCCloseButton)`
  display: none;
  ${theme.breakpoints.mobileMedium(css`
    display: block;
  `)}
`;

// tslint:disable-next-line: variable-name
export const StyledOpenTOCControl = styled(lockTocControlState(false, TOCControl))`
  display: flex;
  padding: 0;
  min-height: unset;
  flex-direction: row;
  justify-content: start;

  ${ButtonText} {
    ${textRegularSize};
  }
`;

// tslint:disable-next-line: variable-name
export const OpenSearchControl = lockSearchControlState(false, SearchControl);

// tslint:disable-next-line: variable-name
export const CloseSearchControl = lockSearchControlState(true, SearchControl);
