import React from 'react';
import styled, { css } from 'styled-components/macro';
import { h4Style } from '../../../components/Typography';
import theme from '../../../theme';
import ContentExcerpt from '../../components/ContentExcerpt';
import { LinkedArchiveTreeSection } from '../../types';
import { PracticeAnswer, PracticeQuestion } from '../types';
import Answer from './Answer';

interface QuestionProps {
  question: PracticeQuestion;
  isSubmitted?: boolean;
  showCorrect?: boolean;
  source: LinkedArchiveTreeSection;
  onSelectAnswer?: (answer: PracticeAnswer) => void;
}

// tslint:disable-next-line: variable-name
const QuestionWrapper = styled.div`
  padding: 0 ${theme.padding.page.desktop}rem;
  ${theme.breakpoints.mobile(css`
    padding: 0 ${theme.padding.page.mobile}rem;
  `)}
`;

// tslint:disable-next-line: variable-name
const QuestionContent = styled(ContentExcerpt)`
  ${h4Style}
  font-weight: bold;
  color: ${theme.color.primary.gray.base};
  padding: 0;
`;

// tslint:disable-next-line: variable-name
const AnswersWrapper = styled.form`
  margin-top: ${theme.padding.page.desktop}rem;
`;

// tslint:disable-next-line: variable-name
const Question = (props: QuestionProps) => {
  const [selectedAnswer, setSelectedAnswer] = React.useState<PracticeAnswer | null>(null);

  return <QuestionWrapper>
    <QuestionContent content={props.question.stem_html} source={props.source} />
    <AnswersWrapper>
      { props.question.answers.map((answer, index) =>
        <Answer key={index} answer={answer} index={index} source={props.source} isSubmitted={false}
          isSelected={ Boolean(selectedAnswer && selectedAnswer.id === answer.id) }
          onSelect={ () => setSelectedAnswer(answer) }/>)
      }
    </AnswersWrapper>
  </QuestionWrapper>;
};

export default Question;
