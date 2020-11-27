import React from 'react';
import { FormattedMessage } from 'react-intl';
import styled, { css } from 'styled-components/macro';
import { textRegularStyle } from '../../../components/Typography';
import theme from '../../../theme';
import ContentExcerpt from '../../components/ContentExcerpt';
import { LinkedArchiveTreeSection } from '../../types';
import { PracticeAnswer, PracticeQuestionStyles } from '../types';
import contants from './contants';

interface AnswerProps {
  isSelected: boolean;
  isSubmitted: boolean;
  showCorrect: boolean;
  answer: PracticeAnswer;
  choiceIndicator: string;
  onSelect: () => void;
  source: LinkedArchiveTreeSection;
}

// tslint:disable-next-line: variable-name
const AnswerExcerpt = styled.span`
  ${textRegularStyle}
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
const AnswerLabel = styled.label`
  background-color: ${(props: {style: PracticeQuestionStyles}) => props.style.focused};
  border: 1.5px solid ${(props: {style: PracticeQuestionStyles}) => props.style.passive};
  min-width: 4rem;
  min-height: 4rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: ${(props: {isSubmitted: boolean}) => props.isSubmitted ? 'not-allowed' : 'pointer'};
  color: ${(props: {style: PracticeQuestionStyles}) => props.style.fontColor};

  input {
    position: absolute;
    opacity: 0;
    height: 0;
    width: 0;
  }
`;

// tslint:disable-next-line: variable-name
export const AnswerBlock = styled.div`
  padding: 0 2rem 2.4rem;
  display: flex;
  align-items: flex-start;
  cursor: ${(props: {isSubmitted: boolean}) => props.isSubmitted ? 'not-allowed' : 'pointer'};

  ${({ isSubmitted }: {isSubmitted: boolean}) => isSubmitted ? null : css`
    &:hover {
      ${AnswerLabel} {
        border-color: ${(props: {style: PracticeQuestionStyles}) => props.style.hovered};
      }
    }
  `}

  ${theme.breakpoints.mobile(css`
    padding: 0 1rem 2.4rem;

    ${ContentExcerpt} {
      padding: 0;
    }
  `)}
`;

// tslint:disable-next-line: variable-name
const AnswerResult = styled.div`
  ${textRegularStyle}
  color: ${(props: {style: PracticeQuestionStyles}) => props.style.passive};
`;

// tslint:disable-next-line: variable-name
const Answer = ({
  answer,
  showCorrect,
  choiceIndicator,
  isSubmitted,
  isSelected,
  onSelect,
}: AnswerProps) => {
  const isCorrect = answer.correctness === '1.0';
  const answerStyle = showCorrect && isCorrect
    ? contants.correctAnswerStyle
    : isSubmitted && isSelected
      ? isCorrect
        ? contants.correctAnswerStyle
        : contants.incorrectAnswerStyle
    : isSelected
      ? contants.selectedAnswerStyle
      : contants.unselectedAnswerStyle;
  const showCorrectResult = (showCorrect && isCorrect)
    || (isSubmitted && isSelected && isCorrect);
  const showIncorrectResults = isSubmitted && isSelected && !isCorrect;
  const showResult = showCorrectResult || showIncorrectResults;
  const resultMsgKey = showCorrectResult
    ? 'i18n:practice-questions:popup:correct'
    : 'i18n:practice-questions:popup:incorrect';

  return <AnswerBlock style={answerStyle} isSubmitted={isSubmitted} onClick={onSelect}>
    <FormattedMessage
      id='i18n:practice-questions:popup:answers:choice'
      values={{choiceIndicator: choiceIndicator.toUpperCase()}}
    >{(msg: string) =>
      <AnswerLabel style={answerStyle} isSubmitted={isSubmitted} aria-label={msg}>
        {choiceIndicator}
        <input
          type='radio'
          name={choiceIndicator}
          checked={isSelected}
          disabled={isSubmitted}
          onChange={onSelect}
        />
      </AnswerLabel>
    }</FormattedMessage>
    <AnswerAlignment>
      <AnswerContent>
        <AnswerExcerpt>{answer.content_html}</AnswerExcerpt>
        {showResult && <AnswerResult style={answerStyle}>
          <FormattedMessage id={resultMsgKey}>
            {(msg: string) => msg}
          </FormattedMessage>
        </AnswerResult>}
      </AnswerContent>
    </AnswerAlignment>
  </AnswerBlock>;
};

export default Answer;
