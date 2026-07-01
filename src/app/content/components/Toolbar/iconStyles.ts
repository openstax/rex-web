import { css } from 'styled-components/macro';
import { textRegularLineHeight } from '../../../components/Typography';

/**
 * Toolbar icon styles as a styled-components css fragment.
 * Used by legacy styled-components consumers; this keeps the styled-components dependency until all callers migrate.
 * @deprecated Use toolbarIconStylesObject for plain CSS implementations.
 */
export const toolbarIconStyles = css`
  height: ${textRegularLineHeight}rem;
  width: ${textRegularLineHeight}rem;
  padding: 0.4rem;
`;

/**
 * Toolbar icon styles as a plain CSS object constant.
 * These values can be used inline or added to CSS files.
 * Use this for new implementations that don't use styled-components.
 */
export const toolbarIconStylesObject = {
  height: `${textRegularLineHeight}rem`,
  width: `${textRegularLineHeight}rem`,
  padding: '0.4rem',
} as const;
