import { closeModal } from '../../navigation/hooks/closeModalHook';
import { openModal } from '../../navigation/hooks/openModalHook';
import { actionHook } from '../../utils';
import { closeKeyboardShortcutsMenu, openKeyboardShortcutsMenu } from './actions';
import { modalUrlName } from './constants';

export default [
  actionHook(closeKeyboardShortcutsMenu, closeModal),
  actionHook(openKeyboardShortcutsMenu, openModal(modalUrlName)),
];
