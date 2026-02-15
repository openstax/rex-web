import { HTMLElement } from '@openstax/types/lib.dom';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled, { AnyStyledComponent,  css } from 'styled-components/macro';
import { typesetMath } from '../../../../helpers/mathjax';
import { h4Style } from '../../../components/Typography';
import { useServices } from '../../../context/Services';
import { match } from '../../../fpUtils';
import theme from '../../../theme';
import { assertWindow } from '../../../utils/browser-assertions';
import ContentExcerpt from '../../components/ContentExcerpt';
import { finishQuestions, setAnswer } from '../actions';
import * as pqSelectors from '../selectors';
import { PracticeAnswer, PracticeQuestion } from '../types';
import Answer from './Answer';
import QuestionNavigation from './QuestionNavigation';

export const QuestionWrapper = styled.form`
  overflow: visible;
  padding: 0 ${theme.padding.page.desktop}rem;
  ${theme.breakpoints.mobile(css`
    padding: 0 ${theme.padding.page.mobile}rem;
  `)}

  fieldset {
    border: none;
    padding: 0;
    margin: 0;
  }
`;

export const QuestionContent = styled(React.forwardRef((props, ref) => <legend tabIndex={0}>
  <ContentExcerpt {...props} tabIndex={-1} ref={ref} disableDynamicContentStyles={true} />
</legend>) as AnyStyledComponent)`
  ${h4Style}
  font-weight: bold;
  color: ${theme.color.primary.gray.base};
  overflow: initial;
  outline: none;
`;

export const AnswersWrapper = styled.div`
  margin-top: ${theme.padding.page.desktop}rem;
  overflow: visible;
`;

const getChoiceLetter = (value: number) => {
  return (value + 10).toString(36);
};

const Question = () => {
  const [selectedAnswerState, setSelectedAnswer] = React.useState<PracticeAnswer | null>(null);
  const [showCorrectState, setShowCorrect] = React.useState<PracticeQuestion | null>(null);
  const container = React.useRef<HTMLElement>(null);
  const questionContent = React.useRef<HTMLElement>(null);
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

    if (questionContent.current) {
      questionContent.current.focus();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [question]);

  if (!section || !question) { return null; }

  const selectedAnswer = question.answers.find(match(selectedAnswerState)) || null;
  const showCorrect = showCorrectState === question;

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isFinalQuestion && isSubmitted) {
      dispatch(finishQuestions());
      return;
    }
    dispatch(setAnswer({ answer: selectedAnswer, questionId: question.uid }));
  };

  return <QuestionWrapper ref={container} onSubmit={onSubmit} data-testid='question-form'>
    <fieldset>
      <QuestionContent ref={questionContent} tabIndex={0} content={question.stem_html} source={section} />
      <AnswersWrapper>
        {question.answers.map((answer, index) =>
          <Answer
            key={index}
            question={question}
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
    </fieldset>
    <QuestionNavigation
      question={question}
      selectedAnswer={selectedAnswer}
      onShowAnswer={() => setShowCorrect(question)}
      hideShowAnswerButton={showCorrect}
    />
  </QuestionWrapper>;
};

export default Question;
