import React from 'react';
import { FormattedMessage } from 'react-intl';
import styled, { css } from 'styled-components/macro';
import { textRegularStyle } from '../../../components/Typography';
import theme from '../../../theme';
import ContentExcerpt from '../../components/ContentExcerpt';
import { LinkedArchiveTreeSection } from '../../types';
import { PracticeAnswer, PracticeQuestionStyles } from '../types';
import pqStyles from './contants';

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
  min-width: 4rem;
  min-height: 4rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;

  input {
    position: absolute;
    opacity: 0;
    height: 0;
    width: 0;
  }
`;

interface AnswerBlockProps {
  showCorrect: boolean;
  isCorrect: boolean;
  isSubmitted: boolean;
  isSelected: boolean;
}

// tslint:disable-next-line: variable-name
export const AnswerBlock = styled.div`
  padding: 0 2rem 2.4rem;
  display: flex;
  align-items: flex-start;
  cursor: ${(props: AnswerBlockProps) => props.isSubmitted ? 'not-allowed' : 'pointer'};
  ${(props: AnswerBlockProps) => {
    let variant: PracticeQuestionStyles['label'];
    if (
      (props.showCorrect && props.isCorrect)
      || (props.isSubmitted && props.isSelected && props.isCorrect)
    ) {
      variant = 'correct';
    } else if (props.isSubmitted && props.isSelected && !props.isCorrect) {
      variant = 'incorrect';
    } else if (props.isSelected) {
      variant = 'selected';
    } else {
      variant = 'unselected';
    }

    return css`
      ${AnswerLabel} {
        color: ${pqStyles[variant].fontColor};
        background-color: ${pqStyles[variant].background};
        border: 1.5px solid ${pqStyles[variant].border};
      }

      &:hover {
        ${AnswerLabel} {
          border-color: ${pqStyles[variant].borderHovered};
        }
      }
    `;
  }}

  ${theme.breakpoints.mobile(css`
    padding: 0 1rem 2.4rem;

    ${ContentExcerpt} {
      padding: 0;
    }
  `)}
`;

// tslint:disable-next-line: variable-name
const StyledAnswerResult = styled.div`
  ${textRegularStyle}
  color: ${(props: {variant: PracticeQuestionStyles['label']}) => pqStyles[props.variant].fontColorActive};
`;

interface AnswerResultProps {
  showCorrect: boolean;
  isSubmitted: boolean;
  isSelected: boolean;
  isCorrect: boolean;
}

// tslint:disable-next-line: variable-name
const AnswerResult = ({ showCorrect, isSelected, isSubmitted, isCorrect }: AnswerResultProps) => {
  const resultMsgKey = isCorrect
    ? 'i18n:practice-questions:popup:correct'
    : 'i18n:practice-questions:popup:incorrect';

  if (
    !(isSubmitted && isSelected)
    && !(isSubmitted && showCorrect && isCorrect)
  ) {
    return null;
  }

  return <StyledAnswerResult variant={isCorrect ? 'correct' : 'incorrect'}>
    <FormattedMessage id={resultMsgKey}>
      {(msg: string) => msg}
    </FormattedMessage>
  </StyledAnswerResult>;
};

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
const Answer = ({
  answer,
  showCorrect,
  choiceIndicator,
  isSubmitted,
  isSelected,
  onSelect,
}: AnswerProps) => {
  const isCorrect = answer.correctness === '1.0';

  return <AnswerBlock
    showCorrect={showCorrect}
    isCorrect={isCorrect}
    isSubmitted={isSubmitted}
    isSelected={isSelected}
    onClick={onSelect}
  >
    <FormattedMessage
      id='i18n:practice-questions:popup:answers:choice'
      values={{choiceIndicator: choiceIndicator.toUpperCase()}}
    >{(msg: string) =>
      <AnswerLabel aria-label={msg}>
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
        <AnswerResult
          showCorrect={showCorrect}
          isSelected={isSelected}
          isSubmitted={isSubmitted}
          isCorrect={isCorrect}
        />
      </AnswerContent>
    </AnswerAlignment>
  </AnswerBlock>;
};

export default Answer;
