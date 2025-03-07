import { HTMLElement, Element } from '@openstax/types/lib.dom';
import { LinkedArchiveTreeNode } from '../../types';
import React from 'react';

export interface KeyboardSupportProps {
  event: React.KeyboardEvent<HTMLAnchorElement>,
  item: LinkedArchiveTreeNode,
  isOpen?: boolean,
  onSelect: () => void,
}

export const useKeyboardSupport = () => {

  const getTreeItems = () => {
    const treeItems = Array.from(document?.querySelectorAll('a[role="treeitem"]') as ArrayLike<Element>);
    const treeItemResults = treeItems.filter((el) => {
      const style = window?.getComputedStyle(el);
      return (style?.display !== 'none')
    });

    return treeItemResults;
  };

  const focusNextTreeItem = (filteredTreeItems: Element[], currentItemIndex: number) => {
    (document?.querySelector(`[id="${filteredTreeItems[currentItemIndex + 1]?.id}"]`) as HTMLElement)?.focus();
  };

  const focusPrevTreeItem = (filteredTreeItems: Element[], currentItemIndex: number) => {
    (document?.querySelector(`[id="${filteredTreeItems[currentItemIndex - 1]?.id}"]`) as HTMLElement)?.focus();
  };

  const focusParent = (filteredTreeItems: Element[], currentItemIndex: number) => {
    (document?.querySelector(
      `[id="${filteredTreeItems[currentItemIndex]?.id}"]`)
      ?.parentElement?.parentElement
      ?.previousElementSibling as HTMLElement)
      ?.focus();
  };

  const focusFirstTreeItem = (filteredTreeItems: Element[]) => {
    (document?.querySelector(`[id="${filteredTreeItems[0]?.id}"]`) as HTMLElement)?.focus();
  };

  const focusLastTreeItem = (filteredTreeItems: Element[]) => {
    (document?.querySelector(`[id="${filteredTreeItems[filteredTreeItems.length - 1]?.id}"]`) as HTMLElement)?.focus();
  };

  const focusOnTab = (filteredTreeItems: Element[], shiftKey: boolean) => {
    const pageElements = Array.from(document?.querySelectorAll('input, button, select, textarea, a[href]') as ArrayLike<Element>);
    let index: number;
    if (shiftKey) {
      focusFirstTreeItem(filteredTreeItems);
      index = pageElements.indexOf(document?.activeElement as HTMLElement) - 1;
    } else {
      focusLastTreeItem(filteredTreeItems);
      index = pageElements.indexOf(document?.activeElement as HTMLElement) + 1;
    }
    (pageElements[index] as HTMLElement)?.focus();
  };

  const searchTreeItem = (filteredTreeItems: Element[], currentItemIndex: number, key: string) => {
    /* 
      According Keyboard Support for Navigation Tree, the search starts with treeItems 
      next to current treeItem and if there is no result, it will look for previous treeItems
    */
    const firstSearchOptions = filteredTreeItems.slice(currentItemIndex + 1, filteredTreeItems.length);
    const secondSearchOptions = filteredTreeItems.slice(0, currentItemIndex);
    let result;
    for (const treeItem of secondSearchOptions) {
      if (treeItem.textContent?.trim().toLowerCase().startsWith(key.toLowerCase())) {
        result = treeItem;
        break;
      }
    }
    for (const treeItem of firstSearchOptions) {
      if (treeItem.textContent?.trim().toLowerCase().startsWith(key.toLowerCase())) {
        result = treeItem;
        break;
      }
    }
    if (result) (document?.querySelector(`[id="${result?.id}"]`) as HTMLElement)?.focus();
  };

  const onKeyDownNavGroupSupport = ({
    event,
    item,
    isOpen,
    onSelect,
  }: KeyboardSupportProps) => {
    event.preventDefault();

    const filteredTreeItems = getTreeItems();
    const currentItem = filteredTreeItems.find((treeitem) => treeitem.id === item.id);
    /* istanbul ignore next */
    const currentItemIndex = currentItem ? filteredTreeItems.indexOf(currentItem) : -1;

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
        searchTreeItem(filteredTreeItems, currentItemIndex, event.key)
        break;
    }
  };

  const onKeyDownNavItemSupport = ({
    event,
    item,
    onSelect,
  }: KeyboardSupportProps) => {
    event.preventDefault();

    const filteredTreeItems = getTreeItems();
    const currentItem = filteredTreeItems.find((treeitem) => treeitem.id === item.id);
    /* istanbul ignore next */
    const currentItemIndex = currentItem ? filteredTreeItems.indexOf(currentItem) : -1;

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
        searchTreeItem(filteredTreeItems, currentItemIndex, event.key)
        break;

    }
  };

  return { onKeyDownNavGroupSupport, onKeyDownNavItemSupport };
};

