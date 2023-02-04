import { Reducer } from 'redux';
import { getType } from 'typesafe-actions';
import { locationChange } from '../../navigation/actions';
import { AnyAction } from '../../types';
import { openToc } from '../actions';
import * as actions from './actions';
import { State } from './types';

export const initialState: State = {
  loading: false,
  mobileToolbarOpen: false,
  previous: {
    query: null,
    results: null,
    selectedResult: null,
  },
  query: null,
  results: null,
  selectedResult: null,
  sidebarOpen: false,
  userSelectedResult: false,
};

const reducer: Reducer<State, AnyAction> = (state = initialState, action) => {

  switch (action.type) {
    case getType(actions.requestSearch): {
      return {
        ...initialState,
        loading: true,
        mobileToolbarOpen: true,
        previous: {
          ...initialState.previous,
          query: action.payload,
        },
        query: action.payload,
        sidebarOpen: true,
      };
    }
    case getType(actions.receiveSearchResults): {
      return {
        ...state,
        loading: false,
        previous: {
          ...state.previous,
          results: action.payload,
        },
        results: action.payload,
        // user selected the result if there is a search scroll target
        userSelectedResult: !!(action.meta && action.meta.searchScrollTarget),
      };
    }
    case getType(actions.selectSearchResult): {
      return {
        ...state,
        previous: {
          ...state.previous,
          selectedResult: action.payload,
        },
        selectedResult: action.payload,
        // user selected the result if this is already set to true OR a result was previously selected
        userSelectedResult: state.userSelectedResult || !!state.selectedResult,
      };
    }
    case getType(actions.openMobileToolbar): {
      return {...state, mobileToolbarOpen: true};
    }
    case getType(openToc):
    case getType(actions.clearSearch): {
      return {
        ...initialState,
        previous: state.previous,
      };
    }
    case getType(actions.openSearchInSidebar): {
      // The mobile view can hide the sidebar when selecting a result
      // while keeping the state & params, so just reopen the sidebar.
      if (state.results && state.query && state.selectedResult) {
        return {...state, sidebarOpen: true};
      }
      // Restore some of the state needed to show the last search state without triggering a search.
      // The previous selectedResult is skipped here, openSearchInSidebarHook uses it directly to
      // trigger a locationChange that will reduce it with the normal flow.
      return {
        ...state,
        query: state.previous.query,
        results: state.previous.results,
        sidebarOpen: true,
      };
    }
    case getType(actions.openSearchResultsMobile): {
      return {...state, sidebarOpen: true};
    }
    case getType(actions.closeSearchResultsMobile): {
      return {...state, sidebarOpen: false};
    }
    case getType(locationChange): {
      if (action.payload.location.search === '') {
        // Clear selectedResult when clicking for example on figure link
        return {...state, selectedResult: null};
      }
      return state;
    }
    default:
      return state;
  }
};

export default reducer;
