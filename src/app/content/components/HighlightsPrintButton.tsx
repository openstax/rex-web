import React from 'react';
import styled from 'styled-components/macro';
import { assertWindow } from '../../utils';
import { printSummaryHighlights } from '../highlights/actions';
import PrintButton from './Toolbar/PrintButton';

interface Props {
  className?: string;
  isLoading: boolean;
  shouldFetchMore: boolean;
  loadHighlightsAndPrint: typeof printSummaryHighlights;
}

// tslint:disable-next-line:variable-name
const StyledPrintButton = styled(PrintButton)`
  min-width: auto;
  height: max-content;
  margin-left: auto;
  cursor: ${({isLoading}) => isLoading ? 'wait' : 'pointer'};
`;

// tslint:disable-next-line:variable-name
export default ({className, isLoading, loadHighlightsAndPrint, shouldFetchMore}: Props) => {
  return <StyledPrintButton
    className={className}
    isLoading={isLoading}
    onClick={() => shouldFetchMore ? loadHighlightsAndPrint() : assertWindow().print()}
    data-testid='hl-print-button'
    disabled={isLoading}
  />;
};
