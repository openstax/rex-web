import { HTMLElement } from '@openstax/types/lib.dom';
import { LinkedArchiveTreeNode } from '../../types';
import React from 'react';
import { assertDocument } from '../../../utils';
import { focusableItemQuery } from '../../../reactUtils';

export interface KeyboardSupportProps {
  event: React.KeyboardEvent<HTMLAnchorElement>;
  item: LinkedArchiveTreeNode;
  isOpen?: boolean;
  treeId?: string;
  onSelect: () => void;
}

const getTreeItems = (treeId: KeyboardSupportProps['treeId']) => {
  return Array.from(
    assertDocument()
    .querySelectorAll<HTMLElement>(`a[role="treeitem"][data-visible="true"][data-treeid="${treeId}"]`)
  );
};

const focusNextTreeItem = (filteredTreeItems: HTMLElement[], currentItemIndex: number) => {
  assertDocument().querySelector<HTMLElement>(`[id="${filteredTreeItems[currentItemIndex + 1]?.id}"]`)?.focus();
};

const focusPrevTreeItem = (filteredTreeItems: HTMLElement[], currentItemIndex: number) => {
  assertDocument().querySelector<HTMLElement>(`[id="${filteredTreeItems[currentItemIndex - 1]?.id}"]`)?.focus();
};

const focusParent = (filteredTreeItems: HTMLElement[], currentItemIndex: number) => {
  (assertDocument().querySelector(
    `[id="${filteredTreeItems[currentItemIndex]?.id}"]`)
    ?.parentElement?.parentElement
    ?.previousElementSibling as HTMLElement)
    ?.focus();
};

const moveToFirstTreeItem = (filteredTreeItems: HTMLElement[]) =>
  assertDocument().querySelector<HTMLElement>(`[id="${filteredTreeItems[0]?.id}"]`);

const moveToLastTreeItem = (filteredTreeItems: HTMLElement[]) =>
  assertDocument().querySelector<HTMLElement>(`[id="${filteredTreeItems[filteredTreeItems.length - 1]?.id}"]`);

/**
 * Handles focus out from Tree component. Tree navigates using arrow keys and tab is disabled inside it.
 * When tab is pressed, this method looks to move focus to previous or next interactive element.
 * @param filteredTreeItems
 * @param shiftKey
 */
const focusOutsideOnTab = (filteredTreeItems: HTMLElement[], shiftKey: boolean) => {
  const focusableElements = Array.from(assertDocument().querySelectorAll<HTMLElement>(focusableItemQuery));
  let index: number;
  // Looks for the first tree interactive element when pressing tab + shift
  if (shiftKey) {
    index = focusableElements.indexOf(moveToFirstTreeItem(filteredTreeItems) as HTMLElement) - 1;
    // Last interactive element if shift is not pressed
  } else {
    index = focusableElements.indexOf(moveToLastTreeItem(filteredTreeItems) as HTMLElement) + 1;
  }
  /**
   *  Then focus the prev or next interactive element
   *  outside Tree component depending if shiftKey is pressed or not.
   */
  focusableElements[index]?.focus();
};

const searchTreeItem = (filteredTreeItems: HTMLElement[], currentItemIndex: number, key: string) => {
  /*
    According Keyboard Support for Navigation Tree, the search starts with treeItems
    next to current treeItem and if there is no result, it will look for previous treeItems
  */
  const searchOptions = filteredTreeItems.slice(currentItemIndex + 1, filteredTreeItems.length)
    .concat(filteredTreeItems.slice(0, currentItemIndex));
  const result = searchOptions.find((treeItem) =>
    treeItem.textContent?.trim().toLowerCase().startsWith(key.toLowerCase())
  );
  if (result) assertDocument().querySelector<HTMLElement>(`[id="${result?.id}"]`)?.focus();
};

function getCurrentItemIndex(item: KeyboardSupportProps['item'], treeId: KeyboardSupportProps['treeId']) {
  const filteredTreeItems = getTreeItems(treeId);
  const currentItemIndex = filteredTreeItems.findIndex((treeitem) =>
    treeitem.id === item.id
  );

  return { filteredTreeItems, currentItemIndex };
}

export const treeNavSubtreeOnKeyDown = ({
  event,
  item,
  isOpen,
  treeId,
  onSelect,
}: KeyboardSupportProps) => {
  event.preventDefault();

  const { filteredTreeItems, currentItemIndex } = getCurrentItemIndex(item, treeId);

  switch (event.key) {
    case 'Enter':
    case ' ':
      onSelect();
      break;
    case 'ArrowDown':
      focusNextTreeItem(filteredTreeItems, currentItemIndex);
      break;
    case 'ArrowUp':
      focusPrevTreeItem(filteredTreeItems, currentItemIndex);
      break;
    case 'ArrowRight':
      if (isOpen) {
        focusNextTreeItem(filteredTreeItems, currentItemIndex);
      } else {
        onSelect();
      }
      break;
    case 'ArrowLeft':
      if (isOpen) {
        onSelect();
      } else {
        focusParent(filteredTreeItems, currentItemIndex);
      }
      break;
    case 'Home':
      moveToFirstTreeItem(filteredTreeItems)?.focus();
      break;
    case 'End':
      moveToLastTreeItem(filteredTreeItems)?.focus();
      break;
    case 'Tab':
      focusOutsideOnTab(filteredTreeItems, event.shiftKey);
      break;
    default:
      searchTreeItem(filteredTreeItems, currentItemIndex, event.key);
      break;
  }
};

export const treeNavItemOnKeyDown = ({
  event,
  item,
  treeId,
  onSelect,
}: KeyboardSupportProps) => {
  event.preventDefault();

  const { filteredTreeItems, currentItemIndex } = getCurrentItemIndex(item, treeId);

  switch (event.key) {
    case 'Enter':
    case ' ':
      onSelect();
      break;
    case 'ArrowDown':
      focusNextTreeItem(filteredTreeItems, currentItemIndex);
      break;
    case 'ArrowUp':
      focusPrevTreeItem(filteredTreeItems, currentItemIndex);
      break;
    case 'ArrowLeft':
      focusParent(filteredTreeItems, currentItemIndex);
      break;
    case 'Home':
      moveToFirstTreeItem(filteredTreeItems)?.focus();
      break;
    case 'End':
      moveToLastTreeItem(filteredTreeItems)?.focus();
      break;
    case 'Tab':
      focusOutsideOnTab(filteredTreeItems, event.shiftKey);
      break;
    default:
      searchTreeItem(filteredTreeItems, currentItemIndex, event.key);
      break;

  }
};

