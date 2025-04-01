import { HTMLElement, Element } from '@openstax/types/lib.dom';
import { LinkedArchiveTreeNode } from '../../types';
import React from 'react';

export interface KeyboardSupportProps {
  event: React.KeyboardEvent<HTMLAnchorElement>;
  item: LinkedArchiveTreeNode;
  isOpen?: boolean;
  onSelect: () => void;
}

const getTreeItems = () => {
  const treeItems = Array.from(document?.querySelectorAll('a[role="treeitem"]') as ArrayLike<HTMLElement>);
  const treeItemResults = treeItems.filter((el) => {
    const style = window?.getComputedStyle(el);
    return (style?.display !== 'none');
  });

  return treeItemResults;
};

const focusNextTreeItem = (filteredTreeItems: Element[], currentItemIndex: number) => {
  document?.querySelector<HTMLElement>(`[id="${filteredTreeItems[currentItemIndex + 1]?.id}"]`)?.focus();
};

const focusPrevTreeItem = (filteredTreeItems: Element[], currentItemIndex: number) => {
  document?.querySelector<HTMLElement>(`[id="${filteredTreeItems[currentItemIndex - 1]?.id}"]`)?.focus();
};

const focusParent = (filteredTreeItems: Element[], currentItemIndex: number) => {
  (document?.querySelector(
    `[id="${filteredTreeItems[currentItemIndex]?.id}"]`)
    ?.parentElement?.parentElement
    ?.previousElementSibling as HTMLElement)
    ?.focus();
};

const focusFirstTreeItem = (filteredTreeItems: Element[]) => {
  document?.querySelector<HTMLElement>(`[id="${filteredTreeItems[0]?.id}"]`)?.focus();
};

const focusLastTreeItem = (filteredTreeItems: Element[]) => {
  document?.querySelector<HTMLElement>(`[id="${filteredTreeItems[filteredTreeItems.length - 1]?.id}"]`)?.focus();
};

const focusOnTab = (filteredTreeItems: Element[], shiftKey: boolean) => {
  const pageElements = Array.from(
    document?.querySelectorAll('input, button, select, textarea, a[href]') as ArrayLike<HTMLElement>
  );
  let index = pageElements.indexOf(document?.activeElement as HTMLElement);
  if (shiftKey) {
    focusFirstTreeItem(filteredTreeItems);
    index -= 1;
  } else {
    focusLastTreeItem(filteredTreeItems);
    index += 1;
  }
  pageElements[index]?.focus();
};

const searchTreeItem = (filteredTreeItems: Element[], currentItemIndex: number, key: string) => {
  /*
    According Keyboard Support for Navigation Tree, the search starts with treeItems
    next to current treeItem and if there is no result, it will look for previous treeItems
  */
  const searchOptions = filteredTreeItems.slice(currentItemIndex + 1, filteredTreeItems.length)
    .concat(filteredTreeItems.slice(0, currentItemIndex));
  const result = searchOptions.find((treeItem) =>
    treeItem.textContent?.trim().toLowerCase().startsWith(key.toLowerCase())
  );
  if (result) document?.querySelector<HTMLElement>(`[id="${result?.id}"]`)?.focus();
};

function getCurrentItemIndex(item: KeyboardSupportProps['item']) {
  const filteredTreeItems = getTreeItems();
  const currentItem = filteredTreeItems.find((treeitem) => treeitem.id === item.id);
  /* istanbul ignore next */
  const currentItemIndex = currentItem ? filteredTreeItems.indexOf(currentItem) : -1;

  return { filteredTreeItems, currentItemIndex };
}

export const onKeyDownNavGroupSupport = ({
  event,
  item,
  isOpen,
  onSelect,
}: KeyboardSupportProps) => {
  event.preventDefault();

  const { filteredTreeItems, currentItemIndex } = getCurrentItemIndex(item);

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
      focusFirstTreeItem(filteredTreeItems);
      break;
    case 'End':
      focusLastTreeItem(filteredTreeItems);
      break;
    case 'Tab':
      focusOnTab(filteredTreeItems, event.shiftKey);
      break;
    default:
      searchTreeItem(filteredTreeItems, currentItemIndex, event.key);
      break;
  }
};

export const onKeyDownNavItemSupport = ({
  event,
  item,
  onSelect,
}: KeyboardSupportProps) => {
  event.preventDefault();

  const { filteredTreeItems, currentItemIndex } = getCurrentItemIndex(item);

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
      focusFirstTreeItem(filteredTreeItems);
      break;
    case 'End':
      focusLastTreeItem(filteredTreeItems);
      break;
    case 'Tab':
      focusOnTab(filteredTreeItems, event.shiftKey);
      break;
    default:
      searchTreeItem(filteredTreeItems, currentItemIndex, event.key);
      break;

  }
};

