import React from 'react';
import { useIntl } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components/macro';
import practiceQuestionsIcon from '../../../../assets/practiceQuestionsIcon.svg';
import { useAnalyticsEvent } from '../../../../helpers/analytics';
import { openPracticeQuestions } from '../../practiceQuestions/actions';
import {
  hasPracticeQuestions,
  isPracticeQuestionsOpen,
  practiceQuestionsEnabled
} from '../../practiceQuestions/selectors';
import { bookAndPage } from '../../selectors';
import { toolbarIconStyles } from './iconStyles';
import { PlainButton, toolbarDefaultButton, toolbarDefaultText } from './styled';

// tslint:disable-next-line:variable-name
export const StyledPracticeQuestionsButton = styled(PlainButton)`
  ${toolbarDefaultButton}
  height: auto;
  padding: 0;

  > svg {
    ${toolbarIconStyles}
  }
`;

// tslint:disable-next-line:variable-name
const PracticeQuestionsIcon = styled.img`
  ${toolbarIconStyles}
`;

// tslint:disable-next-line:variable-name
const PracticeQuestionsText = styled.span`
  ${toolbarDefaultText}
  font-size: 1.2rem;
  line-height: 1.5rem;
`;

// tslint:disable-next-line:variable-name
const PracticeQuestionsButton = () => {
  const dispatch = useDispatch();
  const intl = useIntl();
  const isEnabled = useSelector(practiceQuestionsEnabled);
  const isPracticeQOpen = useSelector(isPracticeQuestionsOpen);
  const trackOpenClose = useAnalyticsEvent('openClosePracticeQuestions');
  const hasPracticeQs = useSelector(hasPracticeQuestions);
  const { book, page } = useSelector(bookAndPage);

  if (!isEnabled || !hasPracticeQs || !book || !page) { return null; }

  const showPracticeQuestions = () => {
    dispatch(openPracticeQuestions());
    trackOpenClose();
  };

  const text = intl.formatMessage({id: 'i18n:toolbar:practice-questions:button:text'});

  return <StyledPracticeQuestionsButton
    onClick={showPracticeQuestions}
    aria-label={text}
    isActive={isPracticeQOpen}>
    <PracticeQuestionsIcon aria-hidden='true' src={practiceQuestionsIcon} />
    <PracticeQuestionsText>{text}</PracticeQuestionsText>
  </StyledPracticeQuestionsButton>;
};

export default PracticeQuestionsButton;
