import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useIntl } from 'react-intl';
import SearchIcon from '../../../../assets/SearchIcon';
import * as searchActions from '../../search/actions';
import * as searchSelectors from '../../search/selectors';
import { OpenButton, ButtonText } from './Buttons';

const closedSearchMessage = 'i18n:toolbar:search:toggle:closed';
const openedSearchMessage = 'i18n:toolbar:search:toggle:opened';

interface SearchControlButtonProps {
  className?: string;
  isActive?: boolean;
}

// Search in sidebar experiment
export const SearchControlButton: React.FC<SearchControlButtonProps> = (props) => {
  const dispatch = useDispatch();
  const isOpen = useSelector(searchSelectors.searchResultsOpen);
  const intl = useIntl();

  const close = () => dispatch(searchActions.clearSearch());
  const open = () => dispatch(searchActions.openSearchInSidebar());

  const message = isOpen ? openedSearchMessage : closedSearchMessage;
  const label = intl.formatMessage({ id: message });
  const action = isOpen ? close : open;

  return (
    <OpenButton
      isOpen={isOpen}
      aria-label={label}
      aria-controls='search-results-sidebar'
      aria-expanded={isOpen}
      data-is-open={isOpen}
      data-analytics-label={label}
      data-testid='desktop-search-button'
      onClick={action}
      {...props}
    >
      <SearchIcon />
      <ButtonText>
        {intl.formatMessage({ id: 'i18n:toolbar:search:text' })}
      </ButtonText>
    </OpenButton>
  );
};
