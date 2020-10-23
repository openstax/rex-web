import React from 'react';
import styled, { css } from 'styled-components/macro';
import theme from '../../../theme';
import { PopupBody } from '../../styles/PopupStyles';

// tslint:disable-next-line:variable-name
export const ShowPracticeQuestionsBody = styled(PopupBody)`
  background: ${theme.color.neutral.darker};
  ${theme.breakpoints.mobile(css`
    text-align: left;
    padding: 0;
  `)}
`;

// tslint:disable-next-line: variable-name
const ShowPracticeQuestions = () => {
  return (
    <ShowPracticeQuestionsBody
      data-testid='show-practice-questions-body'
      data-analytics-region='PQ popup'
    >
    </ShowPracticeQuestionsBody>
  );
};

export default ShowPracticeQuestions;
