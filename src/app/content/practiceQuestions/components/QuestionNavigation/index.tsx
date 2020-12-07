import { HTMLElement } from '@openstax/types/lib.dom';
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
  const nextButton = React.useRef<HTMLElement>(null);
  const showAnswerButton = React.useRef<HTMLElement>(null);
  const questionAnswers = useSelector(pqSelectors.questionAnswers);
  const isFinalQuestion = useSelector(pqSelectors.isFinalQuestion);
  const dispatch = useDispatch();
  const showSkipAndSubmit = !questionAnswers.has(question.uid);
  const submittedAnswer = questionAnswers.get(question.uid);
  const submittedAnswerIsCorrect = Boolean(submittedAnswer && submittedAnswer.correctness === '1.0');
  const showShowAnswer = !props.hideShowAnswerButton && submittedAnswer && !submittedAnswerIsCorrect;
  const showNext = Boolean(submittedAnswer && !isFinalQuestion);
  const showFinish = Boolean(submittedAnswer && isFinalQuestion);
  const ariaLabelForNextButton = submittedAnswerIsCorrect
    ? 'i18n:practice-questions:popup:navigation:next:aria-label:after-correct'
    : 'i18n:practice-questions:popup:navigation:next';
  const ariaLabelForShowAnswerButton = submittedAnswerIsCorrect
    ? 'i18n:practice-questions:popup:navigation:show-answer'
    : 'i18n:practice-questions:popup:navigation:show-answer:aria-label';

  React.useEffect(() => {
    if (!submittedAnswer) { return; }
    if (submittedAnswerIsCorrect && nextButton.current) {
      nextButton.current.focus();
    } else if (!submittedAnswerIsCorrect && showAnswerButton.current) {
      showAnswerButton.current.focus();
    }
  }, [submittedAnswer, submittedAnswerIsCorrect]);

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
            default={true}
            component={<input type='submit' value={msg} />}
          />
        )}
      </FormattedMessage>
    </React.Fragment>}
    {showShowAnswer && <FormattedMessage id={ariaLabelForShowAnswerButton}>
      {(ariaLabel: string) => <FormattedMessage id='i18n:practice-questions:popup:navigation:show-answer'>
        {(msg: string) => (
          <Button
            ref={showAnswerButton}
            size='large'
            variant='transparent'
            default={true}
            aria-label={ariaLabel}
            onClick={(e: React.MouseEvent) => {
              e.preventDefault();
              props.onShowAnswer();
            }}
          >
            {msg}
          </Button>
        )}
      </FormattedMessage>}
    </FormattedMessage>}
    {showNext && <FormattedMessage id={ariaLabelForNextButton}>
      {(ariaLabel: string) => <FormattedMessage id='i18n:practice-questions:popup:navigation:next'>
        {(msg: string) => (
          <Button
            ref={nextButton}
            variant='primary'
            size='large'
            aria-label={ariaLabel}
            value={msg}
            onClick={(e: React.MouseEvent) => {
              e.preventDefault();
              dispatch(nextQuestion());
            }}
          >
            {msg}
          </Button>
        )}
    </FormattedMessage>
    }
    </FormattedMessage>}
    {showFinish && <FormattedMessage id='i18n:practice-questions:popup:navigation:finish'>
      {(msg: string) => <Button
        variant='primary'
        size='large'
        component={<input type='submit' value={msg} />}
      />}
    </FormattedMessage>}
  </Wrapper>;
};

export default QuestionNavigation;
