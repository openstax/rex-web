import theme from '../../../theme';
import { PracticeQuestionStyles } from '../types';

const correctAnswerStyle: PracticeQuestionStyles = {
  focused: '#77AF42',
  fontColor: theme.color.neutral.base,
  hovered: '#77AF42',
  label: 'correct',
  passive: '#77AF42',
};

const incorrectAnswerStyle: PracticeQuestionStyles = {
  focused: theme.color.primary.red.base,
  fontColor: theme.color.neutral.base,
  hovered: theme.color.primary.red.base,
  label: 'incorrect',
  passive: theme.color.primary.red.base,
};

const selectedAnswerStyle: PracticeQuestionStyles = {
  focused: theme.color.secondary.lightBlue.base,
  fontColor: theme.color.neutral.base,
  hovered: theme.color.secondary.lightBlue.base,
  label: 'selected',
  passive: theme.color.secondary.lightBlue.base,
};

const unselectedAnswerStyle: PracticeQuestionStyles = {
  focused: theme.color.neutral.base,
  fontColor: '#606163',
  hovered: theme.color.secondary.lightBlue.base,
  label: 'unselected',
  passive: '#C6C6C6',
};

export default {
  correct: correctAnswerStyle,
  incorrect: incorrectAnswerStyle,
  selected: selectedAnswerStyle,
  unselected: unselectedAnswerStyle,
};
