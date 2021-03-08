import { HTMLElement } from '@openstax/types/lib.dom';
import React from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { LinkedArchiveTreeSection } from '../../../types';
import { PracticeAnswer, PracticeQuestion } from '../../types';
import {
  AnswerAlignment,
  AnswerBlock,
  AnswerContent,
  AnswerExcerpt,
  AnswerIndicator,
  AnswerInput,
  AnswerWrapper,
  StyledAnswerResult,
} from './styled';

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
      {(msg) => msg}
    </FormattedMessage>
  </StyledAnswerResult>;
};

interface AnswerProps {
  isSelected: boolean;
  isSubmitted: boolean;
  showCorrect: boolean;
  answer: PracticeAnswer;
  question: PracticeQuestion;
  choiceIndicator: string;
  onSelect: () => void;
  source: LinkedArchiveTreeSection;
}

// tslint:disable-next-line: variable-name
const Answer = ({
  answer,
  question,
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

  return <AnswerWrapper tabIndex={-1} ref={answerRef}>
    <AnswerInput
      id={choiceIndicator}
      type='radio'
      name={question.uid}
      checked={isSelected}
      disabled={isSubmitted}
      onChange={onSelect}
    />
    <AnswerBlock
      tabIndex={-1}
      htmlFor={choiceIndicator}
      showCorrect={showCorrect}
      isCorrect={isCorrect}
      isSubmitted={isSubmitted}
      isSelected={isSelected}
    >
      <AnswerIndicator
        aria-label={useIntl().formatMessage(
          {id: 'i18n:practice-questions:popup:answers:choice'},
          {choiceIndicator: choiceIndicator.toUpperCase()}
        )}
      >{choiceIndicator}</AnswerIndicator>
      <AnswerAlignment>
        <AnswerContent>
          <AnswerExcerpt dangerouslySetInnerHTML={{ __html: answer.content_html }} />
          <AnswerResult
            showCorrect={showCorrect}
            isSelected={isSelected}
            isSubmitted={isSubmitted}
            isCorrect={isCorrect}
          />
        </AnswerContent>
      </AnswerAlignment>
    </AnswerBlock>
  </AnswerWrapper>;
};

export default Answer;
