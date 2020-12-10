import React from 'react';
import { FormattedMessage } from 'react-intl';
import { useDispatch } from 'react-redux';
import Button from '../../../../components/Button';
import { nextQuestion, setAnswer } from '../../actions';
import { PracticeQuestion } from '../../types';

interface SkipAndSubmitButtonsProps {
  disableSubmit: boolean;
  question: PracticeQuestion;
}

// tslint:disable-next-line: variable-name
const SkipAndSubmitButtons = ({ disableSubmit, question }: SkipAndSubmitButtonsProps) => {
  const dispatch = useDispatch();

  return <React.Fragment>
    <FormattedMessage id='i18n:practice-questions:popup:navigation:skip'>
      {(msg: string) => (
        <Button
          size='large'
          variant='transparent'
          onClick={(e: React.MouseEvent) => {
            e.preventDefault();
            dispatch(setAnswer({ answer: null, questionId: question.uid }));
            dispatch(nextQuestion());
          }}
          data-analytics-label='Skip'
          value={msg}
          component={<input type='button' />}
        />
      )}
    </FormattedMessage>
    <FormattedMessage id='i18n:practice-questions:popup:navigation:submit'>
      {(msg: string) => (
        <Button
          variant='primary'
          size='large'
          disabled={disableSubmit}
          default={true}
          value={msg}
          data-analytics-label='Submit'
          component={<input type='submit' />}
        />
      )}
    </FormattedMessage>
  </React.Fragment>;
};

export default SkipAndSubmitButtons;
