/**
 * Custom hooks for Topbar component
 *
 * These hooks extract business logic and state management from the Topbar component,
 * improving separation of concerns and testability.
 */

import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { HTMLInputElement } from '@openstax/types/lib.dom';
import {
  clearSearch,
  openMobileToolbar,
  requestSearch,
} from '../../search/actions';
import * as selectSearch from '../../search/selectors';
import { isHtmlElement } from '../../../guards';
import { assertDocument } from '../../../utils';

/**
 * Hook that manages search input state and synchronization with Redux.
 *
 * Handles the complex synchronization between local component state (for input responsiveness)
 * and Redux state (for application-wide search state). This eliminates the need for manual
 * synchronization logic in the component.
 *
 * @returns Object containing:
 *   - query: Current search query string
 *   - setQuery: Function to update local query
 *   - formSubmitted: Whether the search form has been submitted
 *   - handleSearchChange: Handler for input change events
 *   - handleSearchClear: Handler for clear button clicks
 *   - handleSearchSubmit: Handler for form submission
 */
export const useSearchState = () => {
  const dispatch = useDispatch();
  const reduxQuery = useSelector(selectSearch.query);

  // Local state for responsive input and form submission tracking
  const prevQuery = React.useRef('');
  const [query, setQuery] = React.useState('');
  const [formSubmitted, setFormSubmitted] = React.useState(false);

  // Sync local query with Redux query when it changes externally
  // (e.g., from browser back/forward navigation or other components)
  if (reduxQuery) {
    if (reduxQuery !== query && reduxQuery !== prevQuery.current) {
      setQuery(reduxQuery);
    }
    prevQuery.current = reduxQuery;
  }

  const handleSearchChange = React.useCallback(
    ({currentTarget}: React.FormEvent<HTMLInputElement>) => {
      setQuery(currentTarget.value);
      setFormSubmitted(false);
    },
    []
  );

  const handleSearchClear = React.useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      dispatch(clearSearch());
      setQuery('');
      setFormSubmitted(false);
    },
    [dispatch]
  );

  const handleSearchSubmit = React.useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const activeElement = assertDocument().activeElement;
      if (query) {
        // Blur the input to dismiss mobile keyboard
        if (isHtmlElement(activeElement)) {
          activeElement.blur();
        }
        dispatch(requestSearch(query));
        setFormSubmitted(true);
      }
    },
    [dispatch, query]
  );

  return {
    query,
    setQuery,
    formSubmitted,
    handleSearchChange,
    handleSearchClear,
    handleSearchSubmit,
  };
};

/**
 * Hook that manages mobile toolbar state and toggle behavior.
 *
 * The mobile toolbar contains the search input and text resizer controls.
 * This hook manages opening/closing the toolbar and clearing search when closed.
 *
 * @returns Object containing:
 *   - mobileToolbarOpen: Boolean indicating whether mobile toolbar is open
 *   - toggleMobile: Handler for toolbar toggle button clicks
 */
export const useMobileToolbar = () => {
  const dispatch = useDispatch();
  const mobileToolbarOpen = useSelector(selectSearch.mobileToolbarOpen);

  const toggleMobile = React.useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();

      if (mobileToolbarOpen) {
        // When closing toolbar, clear the search
        dispatch(clearSearch());
      } else {
        dispatch(openMobileToolbar());
      }
    },
    [dispatch, mobileToolbarOpen]
  );

  return {
    mobileToolbarOpen,
    toggleMobile,
  };
};
