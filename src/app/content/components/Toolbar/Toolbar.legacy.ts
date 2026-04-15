/**
 * Legacy styled-components exports for backward compatibility
 *
 * This file provides styled-components css fragments and constants that are still used elsewhere in the codebase.
 * These will be removed in a future migration phase once all consumers are updated.
 */

import { css } from 'styled-components/macro';
import { maxNavWidth } from '../../../components/NavBar/styled';
import { textRegularSize } from '../../../components/Typography';
import theme from '../../../theme';

/**
 * barPadding - CSS fragment for consistent toolbar padding
 *
 * Used by: Topbar components, SidebarControl, SidebarPane, popUp components
 *
 * @deprecated Use plain CSS with appropriate padding classes or inline styles
 */
export const barPadding = css`
  max-width: ${maxNavWidth}rem;
  margin: 0 auto;
  width: calc(100% - ${theme.padding.page.desktop}rem * 2);
  ${theme.breakpoints.mobile(css`
    width: calc(100% - ${theme.padding.page.mobile}rem * 2);
  `)}
`;

/**
 * toolbarDefaultText - CSS fragment for default toolbar text styling
 *
 * Used by: PracticeQuestionsButton, StudyGuidesButton, HighlightButton
 *
 * @deprecated Use plain CSS with appropriate text classes
 */
export const toolbarDefaultText = css`
  font-weight: 600;
  font-size: 1.2rem;
  line-height: 1.5rem;
  ${theme.breakpoints.mobileMedium(css`
    ${textRegularSize};
    margin-left: 1.2rem;
  `)}
`;

/**
 * toolbarDefaultButton - CSS fragment for default toolbar button styling
 *
 * Used by: PracticeQuestionsButton, StudyGuidesButton, HighlightButton
 *
 * @deprecated Use plain CSS with appropriate button classes
 */
export const toolbarDefaultButton = css`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 77px;
  ${(props: { isActive: boolean }) => props.isActive && `
    background-color: rgba(0,0,0,0.1);
  `}
  ${theme.breakpoints.mobileMedium(css`
    flex-direction: row;
    justify-content: start;
    min-height: unset;
    margin-top: 25px;
    background: none;
  `)}
`;
