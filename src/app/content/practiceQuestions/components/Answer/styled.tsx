import flow from 'lodash/fp/flow';
import styled, { css } from 'styled-components/macro';
import { textRegularStyle } from '../../../../components/Typography';
import theme from '../../../../theme';
import ContentExcerpt from '../../../components/ContentExcerpt';

export const AnswerExcerpt = styled.span`
  ${textRegularStyle}
  width: 100%;
  padding: 0;
  overflow: auto;

  * {
    overflow: initial;
  }
`;

export const AnswerAlignment = styled.div`
  display: flex;
  align-items: center;
  min-height: 4rem;
  flex: 1;
`;

export const AnswerContent = styled.div`
  margin-left: 1.6rem;
  overflow: initial;
`;

export const AnswerIndicator = styled.span`
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
    border: theme.color.secondary.lightBlue.base,
    borderHovered: theme.color.secondary.lightBlue.base,
    fontColor: theme.color.neutral.base,
    fontColorActive: theme.color.secondary.lightBlue.base,
    indicatorBackground: theme.color.secondary.lightBlue.base,
  },
  unselected: {
    background: theme.color.neutral.base,
    border: '#C6C6C6',
    borderHovered: theme.color.secondary.lightBlue.base,
    fontColor: '#606163',
    fontColorActive: '#C6C6C6',
    indicatorBackground: theme.color.neutral.base,
  },
};

interface AnswerBlockProps {
  showCorrect: boolean;
  isCorrect: boolean;
  isSubmitted: boolean;
  isSelected: boolean;
}

const getAnswerTheme = (props: AnswerBlockProps) => {
  if (
    (props.showCorrect && props.isCorrect) || (props.isSubmitted && props.isSelected)
  ) {
    return props.isCorrect ? answerThemes.correct : answerThemes.incorrect;
  } else {
    return props.isSelected ? answerThemes.selected : answerThemes.unselected;
  }
};

const getAnswerThemeCss = (answerTheme: typeof answerThemes[keyof typeof answerThemes]) => css`
  background-color: ${answerTheme.background};

  ${AnswerIndicator} {
    color: ${answerTheme.fontColor};
    background-color: ${answerTheme.indicatorBackground};
    border: 1.5px solid ${answerTheme.border};
  }

  &:hover {
    ${AnswerIndicator} {
      border-color: ${answerTheme.borderHovered};
    }
  }
`;

export const AnswerWrapper = styled.div`
  overflow: visible;
`;

export const AnswerInput = styled.input`
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
`;

export const AnswerBlock = styled.label`
  padding: 1rem 2.4rem;
  display: flex;
  align-items: center;
  cursor: ${(props: AnswerBlockProps) => props.isSubmitted ? 'not-allowed' : 'pointer'};

  :focus {
    outline: none;
  }

  ${flow(getAnswerTheme, getAnswerThemeCss)}
  ${theme.breakpoints.mobile(css`
    padding: 0.5rem 2.4rem;

    ${ContentExcerpt} {
      padding: 0;
    }
  `)}

  ${AnswerWrapper}:focus &,
  input:focus + & {
    outline: auto;
    outline: -webkit-focus-ring-color auto 1px;
  }

  input:not(:focus-visible):focus + & {
    outline: none;
  }
`;

export const StyledAnswerResult = styled.div`
  ${textRegularStyle}
  color: ${({isCorrect}: {isCorrect: boolean}) => answerThemes[isCorrect ? 'correct' : 'incorrect'].fontColorActive};
`;
