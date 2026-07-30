/**
 * Legacy styled-components wrappers for Modal components.
 *
 * @deprecated This file is kept for backward compatibility with existing code
 * that extends Modal components using styled(). Import from './Modal' for new code.
 *
 * These wrappers are intentionally style-less (empty template strings) to enable
 * consumers to extend them with styled-components:
 *
 * @example
 * // Old pattern (still supported via this file):
 * import { Footer } from './Modal/styles';
 * const StyledFooter = styled(Footer)`custom styles`;
 *
 * // New pattern (preferred):
 * import { Footer } from './Modal';
 * <Footer className="custom-footer-class">...</Footer>
 */
import styled from 'styled-components/macro';
import * as ModalComponents from './Modal';

// Styled-components wrappers to enable component extension pattern
export const BodyHeading = styled(ModalComponents.BodyHeading)``;
export const Body = styled(ModalComponents.Body)``;
export const Footer = styled(ModalComponents.Footer)``;
