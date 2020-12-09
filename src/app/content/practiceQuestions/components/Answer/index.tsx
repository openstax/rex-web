import { HTMLElement } from '@openstax/types/lib.dom';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { LinkedArchiveTreeSection } from '../../../types';
import { PracticeAnswer } from '../../types';
import { AnswerAlignment, AnswerBlock, AnswerContent, AnswerExcerpt, AnswerLabel, StyledAnswerResult } from './styled';

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

  return <StyledAnswerResult isCorrect={isCorrect}>
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
  const answerRef = React.useRef<HTMLElement>(null);
  const isCorrect = answer.correctness === '1.0';

  React.useEffect(() => {
    if (showCorrect && isCorrect && answerRef.current) {
      answerRef.current.focus();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showCorrect, isCorrect]);

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
      <React.Fragment>
        <input
          id={choiceIndicator}
          type='radio'
          name={choiceIndicator}
          checked={isSelected}
          disabled={isSubmitted}
          onChange={onSelect}
        />
        <AnswerLabel ref={answerRef} aria-label={msg} for={choiceIndicator} tabIndex={-1}>
          {choiceIndicator}
        </AnswerLabel>
      </React.Fragment>
    }</FormattedMessage>
    <AnswerAlignment>
      <AnswerContent tabIndex={0}>
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
