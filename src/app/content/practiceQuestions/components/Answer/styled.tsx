import flow from 'lodash/fp/flow';
import styled, { css } from 'styled-components/macro';
import { textRegularStyle } from '../../../../components/Typography';
import theme from '../../../../theme';
import ContentExcerpt from '../../../components/ContentExcerpt';

// tslint:disable-next-line: variable-name
export const AnswerExcerpt = styled.span`
  ${textRegularStyle}
  width: 100%;
  padding: 0;
  overflow: auto;

  * {
    overflow: initial;
  }
`;

// tslint:disable-next-line: variable-name
export const AnswerAlignment = styled.div`
  display: flex;
  align-items: center;
  min-height: 4rem;
  flex: 1;
`;

// tslint:disable-next-line: variable-name
export const AnswerContent = styled.div`
  margin-left: 1.6rem;
  overflow: initial;
`;

// tslint:disable-next-line: variable-name
export const AnswerLabel = styled.label`
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
    background: '#77AF42',
    border: '#77AF42',
    borderHovered: '#77AF42',
    fontColor: theme.color.neutral.base,
    fontColorActive: '#77AF42',
  },
  incorrect: {
    background: theme.color.primary.red.base,
    border: theme.color.primary.red.base,
    borderHovered: theme.color.primary.red.base,
    fontColor: theme.color.neutral.base,
    fontColorActive: theme.color.primary.red.base,
  },
  selected: {
    background: theme.color.secondary.lightBlue.base,
    border: theme.color.secondary.lightBlue.base,
    borderHovered: theme.color.secondary.lightBlue.base,
    fontColor: theme.color.neutral.base,
    fontColorActive: theme.color.secondary.lightBlue.base,
  },
  unselected: {
    background: theme.color.neutral.base,
    border: '#C6C6C6',
    borderHovered: theme.color.secondary.lightBlue.base,
    fontColor: '#606163',
    fontColorActive: '#C6C6C6',
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
  ${AnswerLabel} {
    color: ${answerTheme.fontColor};
    background-color: ${answerTheme.background};
    border: 1.5px solid ${answerTheme.border};
  }

  &:hover {
    ${AnswerLabel} {
      border-color: ${answerTheme.borderHovered};
    }
  }
`;

// tslint:disable-next-line: variable-name
export const AnswerBlock = styled.div`
  padding: 0 2rem 2.4rem;
  display: flex;
  align-items: flex-start;
  cursor: ${(props: AnswerBlockProps) => props.isSubmitted ? 'not-allowed' : 'pointer'};
  ${flow(getAnswerTheme, getAnswerThemeCss)}
  ${theme.breakpoints.mobile(css`
    padding: 0 1rem 2.4rem;

    ${ContentExcerpt} {
      padding: 0;
    }
  `)}
`;

// tslint:disable-next-line: variable-name
export const StyledAnswerResult = styled.div`
  ${textRegularStyle}
  color: ${({isCorrect}: {isCorrect: boolean}) => answerThemes[isCorrect ? 'correct' : 'incorrect'].fontColorActive};
`;
