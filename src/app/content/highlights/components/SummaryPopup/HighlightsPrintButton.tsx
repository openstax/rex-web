import React from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components/macro';
import { AppState } from '../../../../types';
import PrintButton from '../../../components/Toolbar/PrintButton';
import { summaryIsLoading } from '../../selectors';

interface Props {
  className: string;
  isLoading: boolean;
  printHighlights: () => void;
}

// tslint:disable-next-line:variable-name
const HighlightsPrintButton = ({className, printHighlights, isLoading}: Props) => {
  return <PrintButton
    className={className}
    onClick={printHighlights}
    data-testid='hl-print-button'
    disabled={isLoading}
  />;
};

// tslint:disable-next-line:variable-name
const StyledHighlightsPrintButton = styled(HighlightsPrintButton)`
  min-width: auto;
  height: max-content;
  margin-left: auto;
  cursor: ${({isLoading}) => isLoading ? 'wait' : 'auto'};
`;

// tslint:disable-next-line:variable-name
export default connect(
  (state: AppState) => ({
    isLoading: summaryIsLoading(state),
  })
)(StyledHighlightsPrintButton);
