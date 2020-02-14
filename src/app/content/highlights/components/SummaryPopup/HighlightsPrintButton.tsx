import flow from 'lodash/fp/flow';
import React from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components/macro';
import { AppState, Dispatch } from '../../../../types';
import PrintButton from '../../../components/Toolbar/PrintButton';
import { printSummaryHighlights } from '../../actions';
import { hasMoreResults } from '../../selectors';

interface Props {
  className: string;
  shouldFetchMore: boolean;
  print: typeof printSummaryHighlights;
}

// tslint:disable-next-line:variable-name
const HighlightsPrintButton = ({className, print, shouldFetchMore}: Props) => {
  return <PrintButton
    className={className}
    onClick={() => print({shouldFetchMore})}
    data-testid='hl-print-button'
  />;
};

// tslint:disable-next-line:variable-name
const ConnectedHighlightsPrintButton = connect(
  (state: AppState) => ({
    shouldFetchMore: hasMoreResults(state),
  }),
  (dispatch: Dispatch) => ({
    print: flow(printSummaryHighlights, dispatch),
  })
)(HighlightsPrintButton);

export default styled(ConnectedHighlightsPrintButton)`
  min-width: auto;
  height: max-content;
  margin-left: auto;
`;
