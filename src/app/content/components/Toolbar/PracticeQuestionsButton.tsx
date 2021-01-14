import React from 'react';
import { FormattedMessage } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components/macro';
import practiceQuestionsIcon from '../../../../assets/practiceQuestionsIcon.svg';
import { useAnalyticsEvent } from '../../../../helpers/analytics';
import { openPracticeQuestions } from '../../practiceQuestions/actions';
import { hasPracticeQuestions, practiceQuestionsEnabled } from '../../practiceQuestions/selectors';
import { PlainButton, toolbarDefaultButton, toolbarDefaultText } from './styled';

// tslint:disable-next-line:variable-name
export const PracticeQuestionsWrapper = styled(PlainButton)`
  ${toolbarDefaultButton}
`;

// tslint:disable-next-line:variable-name
const PracticeQuestionsIcon = styled.img`
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
  const trackOpenClose = useAnalyticsEvent('openClosePracticeQuestions');
  const hasPracticeQs = useSelector(hasPracticeQuestions);

  if (!isEnabled || !hasPracticeQs) { return null; }

  const openPracticeQuestionsSummary = () => {
    dispatch(openPracticeQuestions());
    trackOpenClose();
  };

  return <FormattedMessage id='i18n:toolbar:practice-questions:button:text'>
    {(msg: string) =>
      <PracticeQuestionsWrapper onClick={openPracticeQuestionsSummary} aria-label={msg}>
        <PracticeQuestionsIcon aria-hidden='true' src={practiceQuestionsIcon} />
        <PracticeQuestionsText>{msg}</PracticeQuestionsText>
      </PracticeQuestionsWrapper>
    }
  </FormattedMessage>;
};

export default PracticeQuestionsButton;
