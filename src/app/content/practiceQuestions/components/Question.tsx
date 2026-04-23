import { HTMLElement } from '@openstax/types/lib.dom';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { typesetMath } from '../../../../helpers/mathjax';
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
import './Question.css';

// QuestionContent component wraps ContentExcerpt in a legend element
interface QuestionContentProps {
  content: string;
  source: string | import('../../types').LinkedArchiveTreeSection;
  tabIndex?: number;
}

export const QuestionContent = React.forwardRef<HTMLElement, QuestionContentProps>((props, ref) => {
  return (
    <legend
      className="question-content"
      tabIndex={0}
      style={{
        '--question-content-color': theme.color.primary.gray.base,
      } as React.CSSProperties}
    >
      <ContentExcerpt {...props} tabIndex={-1} ref={ref} disableDynamicContentStyles={true} />
    </legend>
  );
});

// Export wrapper components for backward compatibility with tests
export const QuestionWrapper = React.forwardRef<HTMLFormElement, React.HTMLAttributes<HTMLFormElement>>(
  ({ className, ...props }, ref) => (
    <form
      {...props}
      ref={ref}
      className={className ? `${className} question-wrapper` : 'question-wrapper'}
    />
  )
);

export const AnswersWrapper = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    {...props}
    className={className ? `${className} answers-wrapper` : 'answers-wrapper'}
  />
);

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

  return <QuestionWrapper
    ref={container}
    onSubmit={onSubmit}
    data-testid='question-form'
    style={{
      '--question-padding-desktop': `${theme.padding.page.desktop}rem`,
      '--question-padding-mobile': `${theme.padding.page.mobile}rem`,
    } as React.CSSProperties}
  >
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
