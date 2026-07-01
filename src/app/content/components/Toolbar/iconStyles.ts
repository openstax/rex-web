import { textRegularLineHeight } from '../../../components/Typography';

/**
 * Toolbar icon styles as a plain CSS constant.
 * These values can be used inline or added to the Toolbar.css file.
 */
export const toolbarIconStyles = {
  height: `${textRegularLineHeight}rem`,
  width: `${textRegularLineHeight}rem`,
  padding: '0.4rem',
} as const;
