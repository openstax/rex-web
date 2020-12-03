import theme from '../../../theme';
import { PracticeQuestionStyles } from '../types';

const correctAnswerStyle: PracticeQuestionStyles = {
  background: '#77AF42',
  border: '#77AF42',
  borderHovered: '#77AF42',
  fontColor: theme.color.neutral.base,
  fontColorActive: '#77AF42',
  label: 'correct',
};

const incorrectAnswerStyle: PracticeQuestionStyles = {
  background: theme.color.primary.red.base,
  border: theme.color.primary.red.base,
  borderHovered: theme.color.primary.red.base,
  fontColor: theme.color.neutral.base,
  fontColorActive: theme.color.primary.red.base,
  label: 'incorrect',
};

const selectedAnswerStyle: PracticeQuestionStyles = {
  background: theme.color.secondary.lightBlue.base,
  border: theme.color.secondary.lightBlue.base,
  borderHovered: theme.color.secondary.lightBlue.base,
  fontColor: theme.color.neutral.base,
  fontColorActive: theme.color.secondary.lightBlue.base,
  label: 'selected',
};

const unselectedAnswerStyle: PracticeQuestionStyles = {
  background: theme.color.neutral.base,
  border: '#C6C6C6',
  borderHovered: theme.color.secondary.lightBlue.base,
  fontColor: '#606163',
  fontColorActive: '#C6C6C6',
  label: 'unselected',
};

export default {
  correct: correctAnswerStyle,
  incorrect: incorrectAnswerStyle,
  selected: selectedAnswerStyle,
  unselected: unselectedAnswerStyle,
};
