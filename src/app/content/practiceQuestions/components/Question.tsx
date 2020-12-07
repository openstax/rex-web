import { HTMLElement } from '@openstax/types/lib.dom';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled, { css } from 'styled-components/macro';
import { typesetMath } from '../../../../helpers/mathjax';
import { h4Style } from '../../../components/Typography';
import { useServices } from '../../../context/Services';
import { match } from '../../../fpUtils';
import theme from '../../../theme';
import { assertWindow } from '../../../utils/browser-assertions';
import ContentExcerpt from '../../components/ContentExcerpt';
import { setAnswer, finishQuestions } from '../actions';
import * as pqSelectors from '../selectors';
import { PracticeAnswer, PracticeQuestion } from '../types';
import Answer from './Answer';
import QuestionNavigation from './QuestionNavigation';

// tslint:disable-next-line: variable-name
export const QuestionWrapper = styled.form`
  padding: 0 ${theme.padding.page.desktop}rem;
  ${theme.breakpoints.mobile(css`
    padding: 0 ${theme.padding.page.mobile}rem;
  `)}
`;

// tslint:disable-next-line: variable-name
export const QuestionContent = styled(ContentExcerpt)`
  ${h4Style}
  font-weight: bold;
  color: ${theme.color.primary.gray.base};
  padding: 0;
`;

// tslint:disable-next-line: variable-name
export const AnswersWrapper = styled.div`
  margin-top: ${theme.padding.page.desktop}rem;
`;

const getChoiceLetter = (value: number) => {
  return (value + 10).toString(36);
};

// tslint:disable-next-line: variable-name
const Question = () => {
  const [selectedAnswerState, setSelectedAnswer] = React.useState<PracticeAnswer | null>(null);
  const [showCorrectState, setShowCorrect] = React.useState<PracticeQuestion | null>(null);
  const container = React.useRef<HTMLElement>(null);
  const services = useServices();
  const question = useSelector(pqSelectors.question);
  const section = useSelector(pqSelectors.selectedSection);
  const isSubmitted = useSelector(pqSelectors.isCurrentQuestionSubmitted);
  const isFinalQuestion = useSelector(pqSelectors.isFinalQuestion);

  const dispatch = useDispatch();

  React.useLayoutEffect(() => {
    if (container.current) {
      services.promiseCollector.add(typesetMath(container.current, assertWindow()));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps, ignore promiseCollector
  }, [question]);

  if (!section || !question) { return null; }

  const selectedAnswer = question.answers.find(match(selectedAnswerState)) || null;
  const showCorrect = showCorrectState === question;

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(setAnswer({ answer: selectedAnswer, questionId: question.uid }));
    // handling Finish button
    if (isFinalQuestion && isSubmitted) {
      dispatch(finishQuestions());
    }
  };

  return <QuestionWrapper ref={container} onSubmit={onSubmit} data-testid='question-form'>
    <QuestionContent tabIndex={0} content={question.stem_html} source={section} />
    <AnswersWrapper>
      {question.answers.map((answer, index) =>
        <Answer
          key={index}
          answer={answer}
          choiceIndicator={getChoiceLetter(index)}
          source={section}
          isSubmitted={isSubmitted}
          showCorrect={showCorrect}
          isSelected={Boolean(selectedAnswer && selectedAnswer.id === answer.id)}
          onSelect={() => isSubmitted ? null : setSelectedAnswer(answer)}
        />
      )}
    </AnswersWrapper>
    <QuestionNavigation
      question={question}
      selectedAnswer={selectedAnswer}
      onShowAnswer={() => setShowCorrect(question)}
      hideShowAnswerButton={showCorrect}
    />
  </QuestionWrapper>;
};

export default Question;
