import { HTMLElement } from '@openstax/types/lib.dom';
import React from 'react';
import styled, { css } from 'styled-components/macro';
import { typesetMath } from '../../../../helpers/mathjax';
import { h4Style } from '../../../components/Typography';
import { useServices } from '../../../context/Services';
import theme from '../../../theme';
import { assertWindow } from '../../../utils/browser-assertions';
import ContentExcerpt from '../../components/ContentExcerpt';
import { LinkedArchiveTreeSection } from '../../types';
import { PracticeAnswer, PracticeQuestion } from '../types';
import Answer from './Answer';

interface QuestionProps {
  question: PracticeQuestion;
  isSubmitted?: boolean;
  showCorrect?: boolean;
  source: LinkedArchiveTreeSection;
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

const getChoiceLetter = (value: number) => {
  return (value + 10).toString(36);
};

// tslint:disable-next-line: variable-name
const Question = (props: QuestionProps) => {
  const container = React.useRef<HTMLElement | null>(null);
  const services = useServices();

  const [selectedAnswer, setSelectedAnswer] = React.useState<PracticeAnswer | null>(null);

  React.useLayoutEffect(() => {
    if (container.current) {
      services.promiseCollector.add(typesetMath(container.current, assertWindow()));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps, ignore promiseCollector
  }, [props.question]);

  return <QuestionWrapper ref={container}>
    <QuestionContent content={props.question.stem_html} source={props.source} />
    <AnswersWrapper>
      { props.question.answers.map((answer, index) =>
        <Answer
          key={index}
          answer={answer}
          choiceIndicator={getChoiceLetter(index)}
          source={props.source}
          isSubmitted={false}
          showCorrect={false}
          isSelected={ Boolean(selectedAnswer && selectedAnswer.id === answer.id) }
          onSelect={ () => setSelectedAnswer(answer) }
        />
      ) }
    </AnswersWrapper>
  </QuestionWrapper>;
};

export default Question;
