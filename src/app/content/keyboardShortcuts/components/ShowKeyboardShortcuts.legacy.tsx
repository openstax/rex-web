import styled from 'styled-components/macro';
import * as ShowKeyboardShortcutsComponents from './ShowKeyboardShortcuts.new';

/**
 * Legacy styled-components exports for backward compatibility
 *
 * These wrap the plain CSS versions with styled() to maintain compatibility
 * with existing code that may use component selectors.
 */

export const ShowKeyboardShortcutsBody = styled(ShowKeyboardShortcutsComponents.ShowKeyboardShortcutsBody)``;

export const ShortcutsHeadingDiv = styled(ShowKeyboardShortcutsComponents.ShortcutsHeadingDiv)``;

export const ShortcutsHeading = ShowKeyboardShortcutsComponents.ShortcutsHeading;

export const ShortcutsCard = styled(ShowKeyboardShortcutsComponents.ShortcutsCard)``;

export const ShortcutsTable = styled(ShowKeyboardShortcutsComponents.ShortcutsTable)``;

export const ShortcutRow = styled(ShowKeyboardShortcutsComponents.ShortcutRow)``;

export const ShortcutBlock = styled(ShowKeyboardShortcutsComponents.ShortcutBlock)``;

export const ShortcutKey = styled(ShowKeyboardShortcutsComponents.ShortcutKey)``;

export const Shortcut = ShowKeyboardShortcutsComponents.Shortcut;

export const CaretMessageDiv = styled(ShowKeyboardShortcutsComponents.CaretMessageDiv)``;

export const CaretMessage = ShowKeyboardShortcutsComponents.CaretMessage;

export { default } from './ShowKeyboardShortcuts.new';
