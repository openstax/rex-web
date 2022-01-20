import { connect } from 'react-redux';
import { FlattenSimpleInterpolation } from 'styled-components';
import { css } from 'styled-components/macro';
import theme from '../../../theme';
import { AppState } from '../../../types';
import * as searchSelectors from '../../search/selectors';
import * as contentSelectors from '../../selectors';
import { State } from '../../types';

export const isVerticalNavOpenConnector = connect((state: AppState) => ({
  isVerticalNavOpen: searchSelectors.searchResultsOpen(state) || contentSelectors.tocOpen(state),
}));

export const styleWhenTocClosed = (closedStyle: FlattenSimpleInterpolation) => css`
  ${(props: {isTocOpen: State['tocOpen']}) =>
    props.isTocOpen === null && theme.breakpoints.mobile(closedStyle)}
  ${(props: {isTocOpen: State['tocOpen']}) =>
    props.isTocOpen === false && closedStyle}
`;
