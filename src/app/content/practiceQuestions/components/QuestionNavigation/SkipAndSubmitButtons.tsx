import React from 'react';
import { FormattedMessage } from 'react-intl';
import { useDispatch } from 'react-redux';
import Button from '../../../../components/Button';
import { finishQuestions, nextQuestion, setAnswer } from '../../actions';
import { PracticeQuestion } from '../../types';

interface SkipAndSubmitButtonsProps {
  disableSubmit: boolean;
  isFinalQuestion: boolean;
  question: PracticeQuestion;
}

// tslint:disable-next-line: variable-name
const SkipAndSubmitButtons = ({ disableSubmit, isFinalQuestion, question }: SkipAndSubmitButtonsProps) => {
  const dispatch = useDispatch();

  return <React.Fragment>
    <FormattedMessage id='i18n:practice-questions:popup:navigation:skip'>
      {(msg) => (
        <Button
          size='large'
          variant='transparent'
          onClick={(e: React.MouseEvent) => {
            e.preventDefault();
            dispatch(setAnswer({ answer: null, questionId: question.uid }));
            if (isFinalQuestion) {
              dispatch(finishQuestions());
            } else {
              dispatch(nextQuestion());
            }
          }}
          data-analytics-label='Skip'
          type='button'
        >
          {msg}
        </Button>
      )}
    </FormattedMessage>
    <FormattedMessage id='i18n:practice-questions:popup:navigation:submit'>
      {(msg) => (
        <Button
          variant='primary'
          size='large'
          disabled={disableSubmit}
          default={true}
          data-analytics-label='Submit'
          type='submit'
        >
          {msg}
        </Button>
      )}
    </FormattedMessage>
  </React.Fragment>;
};

export default SkipAndSubmitButtons;
