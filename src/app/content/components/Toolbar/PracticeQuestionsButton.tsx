import React from 'react';
import { useIntl } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import practiceQuestionsIcon from '../../../../assets/practiceQuestionsIcon.svg';
import { useAnalyticsEvent } from '../../../../helpers/analytics';
import { openPracticeQuestions } from '../../practiceQuestions/actions';
import {
  hasPracticeQuestions,
  isPracticeQuestionsOpen,
  practiceQuestionsEnabled,
} from '../../practiceQuestions/selectors';
import { bookAndPage } from '../../selectors';
import { captureOpeningElement } from '../../utils/focusManager';
import { ToolbarDefaultButton, ToolbarDefaultIcon, ToolbarDefaultText } from './ToolbarDefaults';

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
    captureOpeningElement('practicequestions');
    dispatch(openPracticeQuestions());
    trackOpenClose();
  };

  const text = intl.formatMessage({id: 'i18n:toolbar:practice-questions:button:text'});

  return <ToolbarDefaultButton
    onClick={showPracticeQuestions}
    aria-label={text}
    isActive={isPracticeQOpen}>
    <ToolbarDefaultIcon src={practiceQuestionsIcon} />
    <ToolbarDefaultText>{text}</ToolbarDefaultText>
  </ToolbarDefaultButton>;
};

export default PracticeQuestionsButton;
