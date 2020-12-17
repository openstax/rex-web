import { HTMLElement } from '@openstax/types/lib.dom';
import React from 'react';
import { useSelector } from 'react-redux';
import styled, { css } from 'styled-components/macro';
import theme from '../../../../theme';
import * as pqSelectors from '../../selectors';
import { PracticeAnswer, PracticeQuestion } from '../../types';
import FinishButton from './FinishButton';
import NextButton from './NextButton';
import ShowAnswerButton from './ShowAnswerButton';
import SkipAndSubmitButtons from './SkipAndSubmitButtons';

// tslint:disable-next-line: variable-name
const Wrapper = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-bottom: 3.2rem;

  input {
    appearance: none;
  }

  ${theme.breakpoints.mobile(css`
    margin-bottom: 1rem;
  `)}
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
  const showSkipAndSubmit = !questionAnswers.has(question.uid);
  const submittedAnswer = questionAnswers.get(question.uid);
  const submittedAnswerIsCorrect = Boolean(submittedAnswer && submittedAnswer.correctness === '1.0');
  const showShowAnswer = !props.hideShowAnswerButton && submittedAnswer && !submittedAnswerIsCorrect;
  const showNext = Boolean(submittedAnswer && !isFinalQuestion);
  const showFinish = Boolean(submittedAnswer && isFinalQuestion);

  React.useEffect(() => {
    if (!submittedAnswer) { return; }
    if (submittedAnswerIsCorrect && nextButton.current) {
      nextButton.current.focus();
    } else if (!submittedAnswerIsCorrect && showAnswerButton.current) {
      showAnswerButton.current.focus();
    }
  }, [submittedAnswer, submittedAnswerIsCorrect]);

  return <Wrapper>
    {showSkipAndSubmit && <SkipAndSubmitButtons
      isFinalQuestion={isFinalQuestion}
      disableSubmit={!selectedAnswer}
      question={question}
    />}
    {showShowAnswer && <ShowAnswerButton ref={showAnswerButton} onClick={props.onShowAnswer} />}
    {showNext && <NextButton ref={nextButton} submittedAnswerIsCorrect={submittedAnswerIsCorrect} />}
    {showFinish && <FinishButton />}
  </Wrapper>;
};

export default QuestionNavigation;
