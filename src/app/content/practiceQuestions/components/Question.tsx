import React from 'react';
import styled from 'styled-components/macro';
import { h4Style } from '../../../components/Typography';
import theme from '../../../theme';
import ContentExcerpt from '../../components/ContentExcerpt';
import { LinkedArchiveTreeSection } from '../../types';
import { PracticeAnswer, PracticeQuestion } from '../types';

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
`;

// tslint:disable-next-line: variable-name
const QuestionContent = styled(ContentExcerpt)`
  ${h4Style}
  font-weight: bold;
  color: ${theme.color.primary.gray.base};
`;

// tslint:disable-next-line: variable-name
const Question = (props: QuestionProps) => {

  return <QuestionWrapper>
    <QuestionContent content={props.question.stem_html} source={props.source} />
  </QuestionWrapper>;
};

export default Question;
