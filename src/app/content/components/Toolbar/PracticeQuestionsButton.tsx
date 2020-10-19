import React from 'react';
import { FormattedMessage } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components/macro';
import practiceQuestionsIcon from '../../../../assets/practiceQuestionsIcon.svg';
import { openPracticeQuestions } from '../../practiceQuestions/actions';
import { practiceQuestionsEnabled } from '../../practiceQuestions/selectors';
import { toolbarIconStyles } from './iconStyles';
import { PlainButton, toolbarDefaultButton, toolbarDefaultText } from './styled';

// tslint:disable-next-line:variable-name
export const PracticeQuestionsWrapper = styled(PlainButton)`
  ${toolbarDefaultButton}
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
  const dispatch = useDispatch();
  const isEnabled = useSelector(practiceQuestionsEnabled);

  if (!isEnabled) { return null; }

  const openPracticeQuestionsSummary = () => {
    dispatch(openPracticeQuestions());
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
