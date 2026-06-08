import styled from 'styled-components/macro';
import * as PopupComponents from './PopupStyles.new';

// Re-export constants
export * from './PopupConstants';

/**
 * Legacy styled-components exports for backward compatibility
 *
 * These wrap the plain CSS versions with styled() to maintain compatibility
 * with existing code that may use component selectors.
 */

export const PopupWrapper = styled(PopupComponents.PopupWrapper)``;

export const Header = styled(PopupComponents.Header)``;

export const PopupBody = styled(PopupComponents.PopupBody)``;

export const Modal = styled(PopupComponents.Modal)``;

export const CloseIconWrapper = styled(PopupComponents.CloseIconWrapper)``;

export const CloseIcon = styled(PopupComponents.CloseIcon)``;
