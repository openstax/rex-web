import React from 'react';
import { connect } from 'react-redux';
import { useIntl } from 'react-intl';
import SearchIcon from '../../../../assets/SearchIcon';
import * as searchActions from '../../search/actions';
import * as searchSelectors from '../../search/selectors';
import { AppState, Dispatch } from '../../../types';
import type { MiddleProps } from './types';
import { OpenButton, ButtonText } from './Buttons';

const closedSearchMessage = 'i18n:toolbar:search:toggle:closed';
const openedSearchMessage = 'i18n:toolbar:search:toggle:opened';

const searchConnector = connect(
  (state: AppState) => ({
    hasQuery: !!searchSelectors.query(state),
    isOpen: searchSelectors.searchResultsOpen(state),
  }),
  (dispatch: Dispatch) => ({
    close: () => dispatch(searchActions.clearSearch()),
    open: () => {
      dispatch(searchActions.openSearchInSidebar());
    },
  })
);

// Search in sidebar experiment
export const SearchControlButton = searchConnector(
  ({
    open,
    close,
    hasQuery,
    desktop = false,
    ...props
  }: MiddleProps & {
    desktop?: boolean;
    hasQuery: boolean;
  }) => {
    const message = props.isOpen ? openedSearchMessage : closedSearchMessage;
    const label = useIntl().formatMessage({ id: message });
    const action = props.isOpen ? close : open;

    return (
      <OpenButton
        aria-label={label}
        aria-controls='search-results-sidebar'
        aria-expanded={props.isOpen ?? undefined}
        data-analytics-label={label}
        data-testid='desktop-search-button'
        onClick={action}
        {...props}
      >
        <SearchIcon />
        <ButtonText>
          {useIntl().formatMessage({ id: 'i18n:toolbar:search:text' })}
        </ButtonText>
      </OpenButton>
    );
  }
);
