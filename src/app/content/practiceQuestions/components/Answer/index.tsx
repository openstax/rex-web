import { HTMLElement } from '@openstax/types/lib.dom';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { assertNotNull } from '../../../../utils/assertions';
import { LinkedArchiveTreeSection } from '../../../types';
import { PracticeAnswer } from '../../types';
import {
  AnswerAlignment,
  AnswerBlock,
  AnswerContent,
  AnswerExcerpt,
  AnswerIndicator,
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

  const onKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    // Space
    if (e.which === 32) {
      e.preventDefault();
      onSelect();
      // Answer was selected when user pressed Space so we blur it and then focus
      // so screenreader can read it again with updated aria-label for choice indicator.
      assertNotNull(answerRef.current, 'onKeyDown called on unexisting element').blur();
      assertNotNull(answerRef.current, 'onKeyDown called on unexisting element').focus();
    }
  };

  return <AnswerBlock
    showCorrect={showCorrect}
    isCorrect={isCorrect}
    isSubmitted={isSubmitted}
    isSelected={isSelected}
    ref={answerRef}
    tabIndex={0}
    onKeyDown={onKeyDown}
    htmlFor={choiceIndicator}
  >
    <FormattedMessage
      id='i18n:practice-questions:popup:answers:choice'
      values={{choiceIndicator: choiceIndicator.toUpperCase(), selected: isSelected ? 'yes' : 'no'}}
    >{(msg: string) =>
      <React.Fragment>
        <input
          id={choiceIndicator}
          type='radio'
          name={choiceIndicator}
          checked={isSelected}
          disabled={isSubmitted}
          aria-label={msg}
          onChange={onSelect}
          tabIndex={-1}
        />
        <AnswerIndicator aria-label={msg}>
          {choiceIndicator}
        </AnswerIndicator>
      </React.Fragment>
    }</FormattedMessage>
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
  </AnswerBlock>;
};

export default Answer;
