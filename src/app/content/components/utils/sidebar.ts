import { connect } from 'react-redux';
import { AppState } from '../../../types';
import * as searchSelectors from '../../search/selectors';
import * as contentSelectors from '../../selectors';

export const isVerticalNavOpenConnector = connect((state: AppState) => ({
  isDesktopSearchOpen: !!searchSelectors.query(state),
  isTocOpen: contentSelectors.tocOpen(state),
  isVerticalNavOpen: searchSelectors.searchResultsOpen(state) || contentSelectors.tocOpen(state),
}));
