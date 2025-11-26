import React from 'react';
import { connect } from 'react-redux';
import { useIntl } from 'react-intl';
import styled, { css } from 'styled-components/macro';
import SearchIcon from '../../../../assets/SearchIcon';
import theme from '../../../theme';
import * as actions from '../../actions';
import * as searchActions from '../../search/actions';
import * as searchSelectors from '../../search/selectors';
import { AppState, Dispatch } from '../../../types';
import type { InnerProps, MiddleProps } from './types';
import { OpenButton, ButtonText } from './Buttons';

const closedSearchMessage = 'i18n:toolbar:search:toggle:closed';
const openSearchMessage = 'i18n:toolbar:search:toggle:opened';

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

// Search in sidebar experiment
// tslint:disable-next-line:variable-name
export const lockSearchControlState = (isOpen: boolean, Control: React.ComponentType<InnerProps>) =>
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
