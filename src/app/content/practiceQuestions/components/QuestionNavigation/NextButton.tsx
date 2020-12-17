import { HTMLElement } from '@openstax/types/lib.dom';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { useDispatch } from 'react-redux';
import Button from '../../../../components/Button';
import { nextQuestion } from '../../actions';

interface NextButtonProps {
  submittedAnswerIsCorrect: boolean;
}

// tslint:disable-next-line: variable-name
const NextButton = React.forwardRef(({ submittedAnswerIsCorrect }: NextButtonProps, ref: React.Ref<HTMLElement>) => {
  const dispatch = useDispatch();

  const ariaLabelKey = submittedAnswerIsCorrect
    ? 'i18n:practice-questions:popup:navigation:next:after-submit-correct:aria-label'
    : 'i18n:practice-questions:popup:navigation:next';

  return <FormattedMessage id={ariaLabelKey}>
    {(ariaLabel: string) => <FormattedMessage id='i18n:practice-questions:popup:navigation:next'>
      {(msg: string) => (
        <Button
          ref={ref}
          variant='primary'
          size='large'
          aria-label={ariaLabel}
          value={msg}
          data-testid='next'
          data-analytics-label='Next'
          onClick={(e: React.MouseEvent) => {
            e.preventDefault();
            dispatch(nextQuestion());
          }}
        >
          {msg}
        </Button>
      )}
    </FormattedMessage>}
  </FormattedMessage>;
});

export default NextButton;
