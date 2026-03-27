import React from 'react';
import { useIntl } from 'react-intl';
import { useDispatch } from 'react-redux';
import Button from '../../../../components/Button';
import { nextQuestion } from '../../actions';

interface NextButtonProps {
  submittedAnswerIsCorrect: boolean;
}

const NextButton = React.forwardRef<HTMLButtonElement, NextButtonProps>(({ submittedAnswerIsCorrect }, ref) => {
  const dispatch = useDispatch();

  const ariaLabelKey = submittedAnswerIsCorrect
    ? 'i18n:practice-questions:popup:navigation:next:after-submit-correct:aria-label'
    : 'i18n:practice-questions:popup:navigation:next';

  const text = useIntl().formatMessage({id: 'i18n:practice-questions:popup:navigation:next'});

  return <Button
    ref={ref}
    variant='primary'
    size='large'
    aria-label={useIntl().formatMessage({id: ariaLabelKey})}
    value={text}
    data-testid={submittedAnswerIsCorrect ? 'next-is-correct' : 'next'}
    data-analytics-label='Next'
    onClick={(e: React.MouseEvent) => {
      e.preventDefault();
      dispatch(nextQuestion());
    }}
  >
    {text}
  </Button>;
});

export default NextButton;
