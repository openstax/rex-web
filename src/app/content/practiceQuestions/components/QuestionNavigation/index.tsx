import React from 'react';
import { FormattedMessage } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components/macro';
import Button from '../../../../components/Button';
import { nextQuestion, setAnswer } from '../../actions';
import * as pqSelectors from '../../selectors';
import { PracticeAnswer, PracticeQuestion } from '../../types';

// tslint:disable-next-line: variable-name
const Wrapper = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
`;

interface QuestionNavigationProps {
  question: PracticeQuestion;
  selectedAnswer: PracticeAnswer | null;
  onShowAnswer: () => void;
  hideShowAnswerButton: boolean;
}

// tslint:disable-next-line: variable-name
const QuestionNavigation = ({ question, selectedAnswer, ...props }: QuestionNavigationProps) => {
  const questionAnswers = useSelector(pqSelectors.questionAnswers);
  const isFinalQuestion = useSelector(pqSelectors.isFinalQuestion);
  const dispatch = useDispatch();
  const showSkipAndSubmit = !questionAnswers.has(question.uid);
  const submittedAnswer = questionAnswers.get(question.uid);
  const showShowAnswer = !props.hideShowAnswerButton && submittedAnswer && submittedAnswer.correctness === '0.0';
  const showNext = Boolean(submittedAnswer && !isFinalQuestion);
  const showFinish = Boolean(submittedAnswer && isFinalQuestion);

  return <Wrapper>
    {showSkipAndSubmit && <React.Fragment>
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
          >
            {msg}
          </Button>
        )}
      </FormattedMessage>
      <FormattedMessage id='i18n:practice-questions:popup:navigation:submit'>
        {(msg: string) => (
          <Button
            variant='primary'
            size='large'
            disabled={selectedAnswer ? false : true}
            component={<input type='submit' value={msg} />}
          />
        )}
      </FormattedMessage>
    </React.Fragment>}
    {showShowAnswer && <FormattedMessage id='i18n:practice-questions:popup:navigation:show-answer'>
      {(msg: string) => (
        <Button
          size='large'
          variant='transparent'
          default={true}
          onClick={(e: React.MouseEvent) => {
            e.preventDefault();
            props.onShowAnswer();
          }}
        >
          {msg}
        </Button>
      )}
    </FormattedMessage>}
    {showNext && <FormattedMessage id='i18n:practice-questions:popup:navigation:next'>
      {(msg: string) => (
        <Button
          variant='primary'
          size='large'
          value={msg}
          onClick={(e: React.MouseEvent) => {
            e.preventDefault();
            dispatch(nextQuestion());
          }}
        >
          {msg}
        </Button>
      )}
    </FormattedMessage>}
    {showFinish && <FormattedMessage id='i18n:practice-questions:popup:navigation:finish'>
      {(msg: string) => <Button
        size='large'
        component={<input type='submit' value={msg} />}
      />}
    </FormattedMessage>}
  </Wrapper>;
};

export default QuestionNavigation;
