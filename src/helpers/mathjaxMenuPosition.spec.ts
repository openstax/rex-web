import { MutationCallback } from '@openstax/types/lib.dom';
import { assertDocument, assertWindow } from '../app/utils';
import { initializeMathJaxMenuPositioning } from './mathjaxMenuPosition';

describe('initializeMathJaxMenuPositioning', () => {
  it('returns noop when windowImpl is undefined', () => {
    const cleanup = initializeMathJaxMenuPositioning(undefined);
    expect(cleanup()).toBeUndefined();
  });

  it('sets up and tears down', () => {
    const window = assertWindow();
    const disconnect = jest.fn();
    const observe = jest.fn();
    const mockObserver = { disconnect, observe };

    (window as any).MutationObserver = jest.fn(() => mockObserver);

    const cleanup = initializeMathJaxMenuPositioning(window);

    expect(observe).toHaveBeenCalledWith(
      assertDocument().body,
      { childList: true, subtree: true }
    );

    cleanup();
    expect(disconnect).toHaveBeenCalled();
  });

  it('repositions main menu when it overflows', () => {
    const window = assertWindow();
    const document = assertDocument();
    let callback: MutationCallback | undefined;

    (window as any).MutationObserver = jest.fn().mockImplementation((cb) => {
      callback = cb;
      return { disconnect: jest.fn(), observe: jest.fn() };
    });

    const rafSpy = jest.spyOn(window, 'requestAnimationFrame').mockImplementation((cb: any) => {
      cb();
      return 0;
    });

    initializeMathJaxMenuPositioning(window);

    const menu = document.createElement('div');
    menu.className = 'CtxtMenu_ContextMenu';
    jest.spyOn(menu, 'getBoundingClientRect').mockReturnValue({
      right: window.innerWidth + 100,
      width: 200,
    } as any);

    if (callback) {
      callback([{
        addedNodes: [menu],
      }] as any, {} as any);
    }

    expect(rafSpy).toHaveBeenCalled();
    expect(menu.style.left).toBeTruthy();
  });

  it('repositions submenu when it overflows', () => {
    const window = assertWindow();
    const document = assertDocument();
    let callback: MutationCallback | undefined;

    (window as any).MutationObserver = jest.fn().mockImplementation((cb) => {
      callback = cb;
      return { disconnect: jest.fn(), observe: jest.fn() };
    });

    jest.spyOn(window, 'requestAnimationFrame').mockImplementation((cb: any) => {
      cb();
      return 0;
    });

    initializeMathJaxMenuPositioning(window);

    const frame = document.createElement('div');
    frame.className = 'CtxtMenu_MenuFrame';

    const parentMenu = document.createElement('div');
    parentMenu.className = 'CtxtMenu_ContextMenu';
    parentMenu.style.left = '100px';
    jest.spyOn(parentMenu, 'getBoundingClientRect').mockReturnValue({
      left: 150,
      width: 100,
    } as any);

    const submenu = document.createElement('div');
    submenu.className = 'CtxtMenu_ContextMenu';
    jest.spyOn(submenu, 'getBoundingClientRect').mockReturnValue({
      right: window.innerWidth + 50,
      width: 150,
    } as any);

    frame.appendChild(parentMenu);
    frame.appendChild(submenu);
    document.body.appendChild(frame);

    if (callback) {
      callback([{
        addedNodes: [submenu],
      }] as any, {} as any);
    }

    expect(submenu.style.left).toBeTruthy();

    frame.remove();
  });

  it('finds menus within added nodes', () => {
    const window = assertWindow();
    const document = assertDocument();
    let callback: MutationCallback | undefined;

    (window as any).MutationObserver = jest.fn().mockImplementation((cb) => {
      callback = cb;
      return { disconnect: jest.fn(), observe: jest.fn() };
    });

    const rafSpy = jest.spyOn(window, 'requestAnimationFrame').mockImplementation((cb: any) => {
      cb();
      return 0;
    });

    initializeMathJaxMenuPositioning(window);

    const container = document.createElement('div');
    const menu = document.createElement('div');
    menu.className = 'CtxtMenu_ContextMenu';
    container.appendChild(menu);

    jest.spyOn(menu, 'getBoundingClientRect').mockReturnValue({
      right: 100,
      width: 100,
    } as any);

    if (callback) {
      callback([{
        addedNodes: [container],
      }] as any, {} as any);
    }

    expect(rafSpy).toHaveBeenCalled();
  });

  it('does not reposition submenu when it fits', () => {
    const window = assertWindow();
    const document = assertDocument();
    let callback: MutationCallback | undefined;

    (window as any).MutationObserver = jest.fn().mockImplementation((cb) => {
      callback = cb;
      return { disconnect: jest.fn(), observe: jest.fn() };
    });

    jest.spyOn(window, 'requestAnimationFrame').mockImplementation((cb: any) => {
      cb();
      return 0;
    });

    initializeMathJaxMenuPositioning(window);

    const frame = document.createElement('div');
    frame.className = 'CtxtMenu_MenuFrame';

    const parentMenu = document.createElement('div');
    parentMenu.className = 'CtxtMenu_ContextMenu';
    parentMenu.style.left = '200px';
    jest.spyOn(parentMenu, 'getBoundingClientRect').mockReturnValue({
      left: 200,
      width: 100,
    } as any);

    const submenu = document.createElement('div');
    submenu.className = 'CtxtMenu_ContextMenu';
    jest.spyOn(submenu, 'getBoundingClientRect').mockReturnValue({
      right: 400,
      width: 150,
    } as any);

    frame.appendChild(parentMenu);
    frame.appendChild(submenu);
    document.body.appendChild(frame);

    const originalLeft = submenu.style.left;

    if (callback) {
      callback([{
        addedNodes: [submenu],
      }] as any, {} as any);
    }

    expect(submenu.style.left).toBe(originalLeft);

    frame.remove();
  });

  it('handles first menu with no parent', () => {
    const window = assertWindow();
    const document = assertDocument();
    let callback: MutationCallback | undefined;

    (window as any).MutationObserver = jest.fn().mockImplementation((cb) => {
      callback = cb;
      return { disconnect: jest.fn(), observe: jest.fn() };
    });

    jest.spyOn(window, 'requestAnimationFrame').mockImplementation((cb: any) => {
      cb();
      return 0;
    });

    initializeMathJaxMenuPositioning(window);

    const frame = document.createElement('div');
    frame.className = 'CtxtMenu_MenuFrame';

    const firstMenu = document.createElement('div');
    firstMenu.className = 'CtxtMenu_ContextMenu';
    jest.spyOn(firstMenu, 'getBoundingClientRect').mockReturnValue({
      right: 200,
      width: 150,
    } as any);

    frame.appendChild(firstMenu);
    document.body.appendChild(frame);

    if (callback) {
      callback([{
        addedNodes: [firstMenu],
      }] as any, {} as any);
    }

    frame.remove();
  });


  it('ignores non-HTMLElement nodes', () => {
    const window = assertWindow();
    const document = assertDocument();
    let callback: MutationCallback | undefined;

    (window as any).MutationObserver = jest.fn().mockImplementation((cb) => {
      callback = cb;
      return { disconnect: jest.fn(), observe: jest.fn() };
    });

    const rafSpy = jest.spyOn(window, 'requestAnimationFrame');

    initializeMathJaxMenuPositioning(window);

    const textNode = document.createTextNode('test');

    if (callback) {
      callback([{
        addedNodes: [textNode],
      }] as any, {} as any);
    }

    expect(rafSpy).not.toHaveBeenCalled();
  });

  it('ignores non-Element nodes in querySelectorAll results', () => {
    const window = assertWindow();
    const document = assertDocument();
    let callback: MutationCallback | undefined;

    (window as any).MutationObserver = jest.fn().mockImplementation((cb) => {
      callback = cb;
      return { disconnect: jest.fn(), observe: jest.fn() };
    });

    const rafSpy = jest.spyOn(window, 'requestAnimationFrame');

    initializeMathJaxMenuPositioning(window);

    const container = document.createElement('div');
    const nonElementNode = { nodeType: 3 } as any;

    jest.spyOn(container, 'querySelectorAll').mockReturnValue([nonElementNode] as any);

    if (callback) {
      callback([{
        addedNodes: [container],
      }] as any, {} as any);
    }

    expect(rafSpy).not.toHaveBeenCalled();
  });
});
