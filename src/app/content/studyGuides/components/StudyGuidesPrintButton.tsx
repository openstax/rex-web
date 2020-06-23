import React from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components/macro';
import { AppState, Dispatch } from '../../../types';
import { assertWindow } from '../../../utils';
import PrintButton from '../../components/Toolbar/PrintButton';
import { hasMoreResults, summaryIsLoading } from '../selectors';

interface Props {
  className?: string;
  isLoading: boolean;
  shouldFetchMore: boolean;
}

// tslint:disable-next-line:variable-name
const StudyGuidesPrintButton = ({className, isLoading, shouldFetchMore}: Props) => {
  return <PrintButton
    className={className}
    isLoading={isLoading}
    onClick={() => {
      console.log(shouldFetchMore)
      assertWindow().print();
    }}
    data-testid='sg-print-button'
    disabled={isLoading}
  />;
};

// tslint:disable-next-line:variable-name
const ConnectedPrintButton = connect(
  (state: AppState) => ({
    isLoading: summaryIsLoading(state),
    shouldFetchMore: hasMoreResults(state),
  }),
  (dispatch: Dispatch) => ({
    loadHighlightsAndPrint: () => console.log(dispatch),
  })
)(StudyGuidesPrintButton);

// tslint:disable-next-line:variable-name
export default styled(ConnectedPrintButton)`
  min-width: auto;
  height: max-content;
  margin-left: auto;
`;
