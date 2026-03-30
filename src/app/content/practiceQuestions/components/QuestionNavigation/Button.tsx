import styled from 'styled-components/macro';
import ButtonBase from '../../../../components/Button';

/**
 * Styled Button wrapper for QuestionNavigation components.
 *
 * This wrapper exists to make Button compatible with styled-components component selectors
 * used in the QuestionNavigation Wrapper. The Wrapper uses ${Button} selector to apply
 * margin-left: 0.1rem to buttons within the navigation area.
 *
 * Extracted to a separate file to avoid circular dependencies between index.tsx and
 * child components like SkipAndSubmitButtons.tsx.
 */
export const Button = styled(ButtonBase)``;
