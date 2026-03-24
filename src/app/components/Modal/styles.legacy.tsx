/**
 * Legacy styled-components exports for Modal styles
 *
 * These exports maintain backward compatibility with existing code that uses
 * styled-components. They will be removed in a future phase once all call
 * sites have been migrated to use plain CSS.
 */

import styled from 'styled-components/macro';
import * as ModalComponents from './Modal';

// Re-export modalPadding constant
export { modalPadding } from './Modal';

// Legacy styled-components wrappers for backward compatibility
export const ModalWrapper = styled(ModalComponents.ModalWrapper)``;
export const CardWrapper = styled(ModalComponents.CardWrapper)``;
export const Card = styled(ModalComponents.Card)``;
export const Header = styled(ModalComponents.Header)``;
export const Heading = styled(ModalComponents.Heading)``;
export const BodyHeading = styled(ModalComponents.BodyHeading)``;
export const Body = styled(ModalComponents.Body)``;
export const Mask = styled(ModalComponents.Mask)``;
export const Footer = styled(ModalComponents.Footer)``;
export const CloseModalIcon = styled(ModalComponents.CloseModalIcon)``;
