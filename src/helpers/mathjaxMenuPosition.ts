import type * as dom from '@openstax/types/lib.dom';

const MATHJAX_MENU_SELECTOR = '.CtxtMenu_ContextMenu';
const MATHJAX_MENU_FRAME_SELECTOR = '.CtxtMenu_MenuFrame';
const VIEWPORT_PADDING = 10;

function isHTMLElement(node: dom.Node): node is dom.HTMLElement {
  return node.nodeType === 1; // Element.ELEMENT_NODE
}

function getParentMenu(menu: dom.HTMLElement) {
  const menuFrame = menu.closest(MATHJAX_MENU_FRAME_SELECTOR);
  if (!menuFrame) {
    return null;
  }

  const allMenus = Array.from(menuFrame.querySelectorAll(MATHJAX_MENU_SELECTOR));
  const menuIndex = allMenus.indexOf(menu);

  return menuIndex > 0 ? (allMenus[menuIndex - 1] as dom.HTMLElement) : null;
}

function repositionMenu(menu: dom.HTMLElement, windowImpl: Window) {
  windowImpl.requestAnimationFrame(() => {
    const viewport = {
      width: windowImpl.innerWidth,
      height: windowImpl.innerHeight,
    };
    const bounds = menu.getBoundingClientRect();
    const parentMenu = getParentMenu(menu);
    const scrollX = windowImpl.scrollX || windowImpl.pageXOffset || 0;

    if (parentMenu) {
      // Submenu
      const parentBounds = parentMenu.getBoundingClientRect();
      const parentPositionedLeft = parseInt(parentMenu.style.left, 10) < parentBounds.left + scrollX;
      const shouldPositionLeft =
        bounds.right > viewport.width - VIEWPORT_PADDING ||
        parentPositionedLeft;

      if (shouldPositionLeft) {
        const newLeft = Math.max(VIEWPORT_PADDING, parentBounds.left - bounds.width) + scrollX;
        menu.style.left = `${newLeft}px`;
      }
    } else {
      // Main menu
      if (bounds.right > viewport.width - VIEWPORT_PADDING) {
        const newLeft = Math.max(
          VIEWPORT_PADDING,
          viewport.width - bounds.width - VIEWPORT_PADDING
        ) + scrollX;
        menu.style.left = `${newLeft}px`;
      }
    }
  });
}

// Monitor for MathJax context menu to reposition menus that would overflow the viewport.
export const initializeMathJaxMenuPositioning = (windowImpl?: Window) => {
  if (typeof windowImpl === 'undefined' || typeof MutationObserver === 'undefined') {
    return () => undefined;
  }

  const observer = new MutationObserver((mutations: dom.MutationRecord[]) => {
    for (const mutation of mutations) {
      for (const node of Array.from(mutation.addedNodes)) {
        if (isHTMLElement(node)) {
          if (node.matches(MATHJAX_MENU_SELECTOR)) {
            repositionMenu(node, windowImpl);
          }
          const menus = node.querySelectorAll(MATHJAX_MENU_SELECTOR);
          menus.forEach((menu: dom.Element) => {
            if (isHTMLElement(menu)) {
              repositionMenu(menu, windowImpl);
            }
          });
        }
      }
    }
  });

  observer.observe(windowImpl.document.body, {
    childList: true,
    subtree: true,
  });

  return () => observer.disconnect();
};
