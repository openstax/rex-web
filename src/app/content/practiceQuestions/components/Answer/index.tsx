import { HTMLElement } from '@openstax/types/lib.dom';
import classNames from 'classnames';
import React from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { linkColor, linkHover } from '../../../../components/Typography/Links.constants';
import theme, { hiddenButAccessibleClass } from '../../../../theme';
import { LinkedArchiveTreeSection } from '../../../types';
import { PracticeAnswer, PracticeQuestion } from '../../types';
import './Answer.css';

interface AnswerResultProps {
  showCorrect: boolean;
  isSubmitted: boolean;
  isSelected: boolean;
  isCorrect: boolean;
}

// Answer theme definitions (matching styled.tsx)
const answerThemes = {
  correct: {
    background: theme.color.neutral.base,
    border: '#148a00',
    borderHovered: '#148a00',
    fontColor: theme.color.neutral.base,
    fontColorActive: '#148a00',
    indicatorBackground: '#148a00',
  },
  incorrect: {
    background: theme.color.neutral.base,
    border: theme.color.primary.red.base,
    borderHovered: theme.color.primary.red.base,
    fontColor: theme.color.neutral.base,
    fontColorActive: theme.color.primary.red.base,
    indicatorBackground: theme.color.primary.red.base,
  },
  selected: {
    background: '#E3F8FB',
    border: linkHover, // linkColor has insufficient contrast with background
    borderHovered: linkHover,
    fontColor: theme.color.neutral.base,
    fontColorActive: theme.color.secondary.lightBlue.base,
    indicatorBackground: linkColor,
  },
  unselected: {
    background: theme.color.neutral.base,
    border: theme.color.primary.gray.medium,
    borderHovered: linkHover,
    fontColor: theme.color.text.label,
    fontColorActive: '#C6C6C6',
    indicatorBackground: theme.color.neutral.base,
  },
};

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

  const resultTheme = isCorrect ? answerThemes.correct : answerThemes.incorrect;

  return <div
    className="answer-result"
    style={{
      '--answer-result-color': resultTheme.fontColorActive,
    } as React.CSSProperties}
  >
    <FormattedMessage id={resultMsgKey}>
      {(msg) => msg}
    </FormattedMessage>
  </div>;
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

  // Determine which theme to apply based on answer state
  const getAnswerTheme = () => {
    if ((showCorrect && isCorrect) || (isSubmitted && isSelected)) {
      return isCorrect ? answerThemes.correct : answerThemes.incorrect;
    } else {
      return isSelected ? answerThemes.selected : answerThemes.unselected;
    }
  };

  const answerTheme = getAnswerTheme();
  const themeKey = (showCorrect && isCorrect) || (isSubmitted && isSelected)
    ? (isCorrect ? 'correct' : 'incorrect')
    : (isSelected ? 'selected' : 'unselected');
  const {formatMessage} = useIntl();

  return <div className="answer-wrapper" tabIndex={-1} ref={answerRef}>
    <input
      id={choiceIndicator}
      type='radio'
      name={question.uid}
      checked={isSelected}
      disabled={isSubmitted}
      onChange={onSelect}
      className={hiddenButAccessibleClass}
    />
    <label
      tabIndex={-1}
      htmlFor={choiceIndicator}
      className={classNames('answer-block', {
        'answer-block--disabled': isSubmitted,
        [`answer-block--${themeKey}`]: true,
      })}
      style={{
        [`--answer-bg-${themeKey}`]: answerTheme.background,
        [`--answer-indicator-fg-${themeKey}`]: answerTheme.fontColor,
        [`--answer-indicator-bg-${themeKey}`]: answerTheme.indicatorBackground,
        [`--answer-border-${themeKey}`]: answerTheme.border,
        [`--answer-border-hover-${themeKey}`]: answerTheme.borderHovered,
      } as React.CSSProperties}
    >
      <span
        className="answer-indicator"
        aria-label={formatMessage(
          {id: 'i18n:practice-questions:popup:answers:choice'},
          {choiceIndicator: choiceIndicator.toUpperCase()}
        )}
      >{choiceIndicator}</span>
      <div className="answer-alignment">
        <div className="answer-content">
          <span className="answer-excerpt" dangerouslySetInnerHTML={{ __html: answer.content_html }} />
          <AnswerResult
            showCorrect={showCorrect}
            isSelected={isSelected}
            isSubmitted={isSubmitted}
            isCorrect={isCorrect}
          />
        </div>
      </div>
    </label>
  </div>;
};

export default Answer;
