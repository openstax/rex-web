import { createStandardAction } from 'typesafe-actions';

export const openKeyboardShortcutsMenu = createStandardAction('Content/KeyboardShortcuts/Menu/open')<void>();
export const closeKeyboardShortcutsMenu = createStandardAction('Content/KeyboardShortcuts/Menu/close')<void>();
