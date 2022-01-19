import { connect } from 'react-redux';
import { FlattenSimpleInterpolation } from 'styled-components';
import { css } from 'styled-components/macro';
import theme from '../../../theme';
import { AppState } from '../../../types';
import * as searchSelectors from '../../search/selectors';
import * as contentSelectors from '../../selectors';
import { State } from '../../types';

export const isVerticalNavOpenConnector = connect((state: AppState) => ({
  verticalNavOpen: searchSelectors.searchResultsOpen(state) || contentSelectors.tocOpen(state),
}));

export const styleWhenSidebarClosed = (closedStyle: FlattenSimpleInterpolation) => css`
  ${(props: {isVerticalNavOpen: State['tocOpen']}) =>
    props.isVerticalNavOpen === null && theme.breakpoints.mobile(closedStyle)}
  ${(props: {isVerticalNavOpen: State['tocOpen']}) =>
    props.isVerticalNavOpen === false && closedStyle}
`;
