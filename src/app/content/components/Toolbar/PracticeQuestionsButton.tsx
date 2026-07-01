import React from 'react';
import { useIntl } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import classNames from 'classnames';
import practiceQuestionsIcon from '../../../../assets/practiceQuestionsIcon.svg';
import { useAnalyticsEvent } from '../../../../helpers/analytics';
import { openPracticeQuestions } from '../../practiceQuestions/actions';
import {
  hasPracticeQuestions,
  isPracticeQuestionsOpen,
  practiceQuestionsEnabled,
} from '../../practiceQuestions/selectors';
import { bookAndPage } from '../../selectors';
import { PlainButton } from './styled';
import { captureOpeningElement } from '../../utils/focusManager';
import './Toolbar.css';

export const StyledPracticeQuestionsButton = function StyledPracticeQuestionsButton({
  isActive,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  isActive?: boolean;
}) {
  return (
    <PlainButton
      {...props}
      className={classNames(
        'toolbar-default-button',
        { 'is-active': isActive },
        className
      )}
    />
  );
};

const PracticeQuestionsIcon = function PracticeQuestionsIcon({
  className,
  ...props
}: React.ImgHTMLAttributes<HTMLImageElement>) {
  return (
    <img
      {...props}
      alt=""
      aria-hidden="true"
      className={classNames('toolbar-default-icon', className)}
    />
  );
};

const PracticeQuestionsText = function PracticeQuestionsText({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      {...props}
      className={classNames('toolbar-default-text', className)}
    />
  );
};

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

  return <StyledPracticeQuestionsButton
    onClick={showPracticeQuestions}
    aria-label={text}
    isActive={isPracticeQOpen}>
    <PracticeQuestionsIcon aria-hidden='true' src={practiceQuestionsIcon} />
    <PracticeQuestionsText>{text}</PracticeQuestionsText>
  </StyledPracticeQuestionsButton>;
};

export default PracticeQuestionsButton;
