import React from 'react';
import styled, { css } from 'styled-components/macro';
import { h4Style } from '../../../components/Typography';
import theme from '../../../theme';
import ContentExcerpt from '../../components/ContentExcerpt';
import { practiceQuestionStyles } from '../../constants';
import { LinkedArchiveTreeSection } from '../../types';
import { PracticeAnswer, PracticeQuestionStyles } from '../types';

const correctAnswerStyle = practiceQuestionStyles.find((search) => search.label === 'correct');
const incorrectAnswerStyle = practiceQuestionStyles.find((search) => search.label === 'incorrect');
const selectedAnswerStyle = practiceQuestionStyles.find((search) => search.label === 'selected');
const unselectedAnswerStyle = practiceQuestionStyles.find((search) => search.label === 'unselected');

interface AnswerProps {
  isSelected?: boolean;
  isSubmitted: boolean;
  showCorrect?: boolean;
  answer: PracticeAnswer;
  index: number;
  onSelect?: () => void;
  source: LinkedArchiveTreeSection;
}

const getChoiceLetter = (value: number) => {
  return (value + 10).toString(36);
};

// tslint:disable-next-line: variable-name
const AnswerExcerpt = styled(ContentExcerpt)`
  ${h4Style}
  width: 100%;
  padding: 0;
`;

// tslint:disable-next-line: variable-name
const AnswerAlignment = styled.div`
  display: flex;
  align-items: center;
  min-height: 4rem;
`;

// tslint:disable-next-line: variable-name
const AnswerContent = styled.div`
  margin-left: 1.6rem;
`;

// tslint:disable-next-line: variable-name
const AnswerBlock = styled.div`
  padding: 0 2rem 2.4rem;
  display: flex;
  align-items: flex-start;
  ${theme.breakpoints.mobile(css`
    padding: 0 1rem 2.4rem;
  `)}
`;

// tslint:disable-next-line: variable-name
const AnswerButton = styled.label`
  background-color: ${(props: {style: PracticeQuestionStyles}) => props.style.focused};
  border: 1.5px solid ${(props: {style: PracticeQuestionStyles}) => props.style.passive};
  min-width: 4rem;
  min-height: 4rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${(props: {style: PracticeQuestionStyles}) => props.style.fontColor};

  &:focus-within {
    outline: -webkit-focus-ring-color auto 1px;
  }

  &:focus-within,
  &:hover {
    border-color: ${(props: {style: PracticeQuestionStyles}) => props.style.hovered};
  }

  input {
    position: absolute;
    opacity: 0;
    cursor: pointer;
    height: 0;
    width: 0;
  }
`;

// tslint:disable-next-line: variable-name
const AnswerCheck = styled.span`
  ${h4Style}
  color: ${(props: {style: PracticeQuestionStyles}) => props.style.focused};
  text-transform: capitalize;
  width: 100%;
  padding: 0;
`;

// tslint:disable-next-line: variable-name
const Answers = (props: AnswerProps) => {
  const isCorrect = props.answer.correctness === '1.0';
  const showAnswer = (props.isSubmitted && props.isSelected) || props.showCorrect ? true : false;
  const answerStyle = props.isSelected
    ? (showAnswer ? (isCorrect ? correctAnswerStyle : incorrectAnswerStyle) : selectedAnswerStyle)
    : unselectedAnswerStyle;

  return<AnswerBlock style={answerStyle} choiceIndicator={getChoiceLetter(props.index)}>
    <AnswerButton style={answerStyle} for={props.answer.id}>
      {getChoiceLetter(props.index)}
      <input type='radio' id={`${props.answer.id}`} name={getChoiceLetter(props.index)}
        checked={props.isSelected} onChange={props.onSelect} />
    </AnswerButton>
    <AnswerAlignment>
      <AnswerContent>
        <AnswerExcerpt content={props.answer.content_html} source={props.source} />
        {
          showAnswer && <AnswerCheck style={answerStyle}>
            { answerStyle && answerStyle.label }
          </AnswerCheck>
        }
      </AnswerContent>
    </AnswerAlignment>
  </AnswerBlock>;
};

export default Answers;
