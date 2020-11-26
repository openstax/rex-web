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
  cursor: pointer;
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
  cursor: pointer;

  &:hover {
    ${AnswerLabel} {
      border-color: ${(props: {style: PracticeQuestionStyles}) => props.style.hovered};
    }
  }

  ${theme.breakpoints.mobile(css`
    padding: 0 1rem 2.4rem;

    ${ContentExcerpt} {
      padding: 0;
    }
  `)}
`;

// tslint:disable-next-line: variable-name
const Answer = (props: AnswerProps) => {
  const answerStyle = props.isSelected ? contants.selectedAnswerStyle : contants.unselectedAnswerStyle;

  return <AnswerBlock style={answerStyle} onClick={props.onSelect}>
    <FormattedMessage
      id='i18n:practice-questions:popup:answers:choice'
      values={{choiceIndicator: props.choiceIndicator.toUpperCase()}}
    >{(msg: string) =>
      <AnswerLabel style={answerStyle} htmlFor={props.answer.id} aria-label={msg}>
        {props.choiceIndicator}
        <input
          type='radio'
          id={`${props.answer.id}`}
          name={props.choiceIndicator}
          checked={props.isSelected}
          onChange={props.onSelect}
        />
      </AnswerLabel>
    }</FormattedMessage>
    <AnswerAlignment>
      <AnswerContent>
        <AnswerExcerpt>{props.answer.content_html}</AnswerExcerpt>
      </AnswerContent>
    </AnswerAlignment>
  </AnswerBlock>;
};

export default Answer;
