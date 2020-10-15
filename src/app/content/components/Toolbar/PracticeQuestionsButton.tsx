import React from 'react';
import { FormattedMessage } from 'react-intl';
import { useSelector } from 'react-redux';
import styled, { css } from 'styled-components/macro';
import practiceQuestionsIcon from '../../../../assets/practiceQuestionsIcon.svg';
import theme from '../../../theme';
import { practiceQuestionsEnabled } from '../../practiceQuestions/selectors';
import { toolbarIconStyles } from './iconStyles';
import { PlainButton, toolbarDefaultText } from './styled';

// tslint:disable-next-line:variable-name
export const PracticeQuestionsWrapper = styled(PlainButton)`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 2rem;
  height: auto;
  ${theme.breakpoints.mobile(css`
    margin-right: 0;
  `)}
`;

// tslint:disable-next-line:variable-name
const PracticeQuestionsIcon = styled.img`
  ${toolbarIconStyles}
  padding: 0.2rem;
`;

// tslint:disable-next-line:variable-name
const PracticeQuestionsText = styled.span`
  ${toolbarDefaultText}
`;

// tslint:disable-next-line:variable-name
const PracticeQuestionsButton = () => {
  const isEnabled = useSelector(practiceQuestionsEnabled);

  if (!isEnabled) { return null; }

  const openPracticeQuestionsSummary = () => {
    // Noop for now
  };

  return <FormattedMessage id='i18n:toolbar:practice-questions:button:text'>
    {(msg: Element | string) =>
      <PracticeQuestionsWrapper onClick={openPracticeQuestionsSummary} aria-label={msg}>
        <PracticeQuestionsIcon aria-hidden='true' src={practiceQuestionsIcon} />
        <PracticeQuestionsText>{msg}</PracticeQuestionsText>
      </PracticeQuestionsWrapper>
    }
  </FormattedMessage>;
};

export default PracticeQuestionsButton;
