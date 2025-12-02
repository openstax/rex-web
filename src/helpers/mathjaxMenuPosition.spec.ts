import { initializeMathJaxMenuPositioning } from './mathjaxMenuPosition';

// Wait for MutationObserver + requestAnimationFrame to process
const waitForObserver = () => new Promise((resolve) => {
  // Wait for MutationObserver callback
  setTimeout(() => {
    // Then wait for requestAnimationFrame
    requestAnimationFrame(() => {
      // Add small delay to ensure styles are applied
      setTimeout(resolve, 10);
    });
  }, 0);
});

describe('initializeMathJaxMenuPositioning', () => {
  let cleanup: (() => void) | undefined;

  afterEach(() => {
    // Clean up any created menus
    if (document) {
      document.querySelectorAll('.CtxtMenu_ContextMenu').forEach((el) => el.remove());
    }
    // Disconnect observer
    if (cleanup) {
      cleanup();
      cleanup = undefined;
    }
  });

  it('returns cleanup function when initialized', () => {
    if (!window) {
      expect(window).toBeTruthy();
      return;
    }

    cleanup = initializeMathJaxMenuPositioning(window);

    expect(cleanup).toBeDefined();
    expect(typeof cleanup).toBe('function');
  });

  it('returns no-op when window is undefined', () => {
    const cleanup = initializeMathJaxMenuPositioning(undefined as any);

    expect(cleanup).toBeDefined();
    expect(typeof cleanup).toBe('function');
    expect(cleanup()).toBeUndefined();
  });

  it('repositions menu when it overflows right edge', async() => {
    if (!document || !window) {
      expect(document).toBeTruthy();
      expect(window).toBeTruthy();
      return;
    }

    const windowImpl = window;
    cleanup = initializeMathJaxMenuPositioning(windowImpl);

    // Create menu that overflows right edge
    const menu = document.createElement('div');
    menu.className = 'CtxtMenu_ContextMenu';
    menu.style.position = 'fixed';
    menu.style.left = `${windowImpl.innerWidth - 50}px`; // Will overflow
    menu.style.top = '100px';
    menu.style.width = '200px';
    menu.style.height = '100px';

    // Mock getBoundingClientRect to simulate overflow
    const viewportWidth = windowImpl.innerWidth;
    menu.getBoundingClientRect = jest.fn(() => ({
      left: viewportWidth - 50,
      top: 100,
      right: viewportWidth + 150, // Overflows by 150px
      bottom: 200,
      width: 200,
      height: 100,
      x: viewportWidth - 50,
      y: 100,
      toJSON: () => {},
    }));

    document.body.appendChild(menu);
    await waitForObserver();

    // Menu should be repositioned to prevent overflow
    const newLeft = parseInt(menu.style.left, 10);
    const menuRight = newLeft + 200; // width
    expect(menuRight).toBeLessThanOrEqual(windowImpl.innerWidth - 10); // viewport padding
  });

  it('repositions menu when it overflows bottom edge', async() => {
    if (!document || !window) {
      expect(document).toBeTruthy();
      expect(window).toBeTruthy();
      return;
    }

    const windowImpl = window;
    cleanup = initializeMathJaxMenuPositioning(windowImpl);

    // Create menu that overflows bottom edge
    const menu = document.createElement('div');
    menu.className = 'CtxtMenu_ContextMenu';
    menu.style.position = 'fixed';
    menu.style.left = '100px';
    menu.style.top = `${windowImpl.innerHeight - 50}px`; // Will overflow
    menu.style.width = '200px';
    menu.style.height = '100px';

    // Mock getBoundingClientRect to simulate overflow
    const viewportHeight = windowImpl.innerHeight;
    menu.getBoundingClientRect = jest.fn(() => ({
      left: 100,
      top: viewportHeight - 50,
      right: 300,
      bottom: viewportHeight + 50, // Overflows by 50px
      width: 200,
      height: 100,
      x: 100,
      y: viewportHeight - 50,
      toJSON: () => {},
    }));

    document.body.appendChild(menu);
    await waitForObserver();

    // Menu should be repositioned to prevent overflow
    const newTop = parseInt(menu.style.top, 10);
    const menuBottom = newTop + 100; // height
    expect(menuBottom).toBeLessThanOrEqual(window.innerHeight - 10); // viewport padding
  });

  it('repositions menu when it overflows both right and bottom edges', async() => {
    if (!document || !window) {
      expect(document).toBeTruthy();
      expect(window).toBeTruthy();
      return;
    }

    const windowImpl = window;
    cleanup = initializeMathJaxMenuPositioning(windowImpl);

    // Create menu that overflows both edges
    const menu = document.createElement('div');
    menu.className = 'CtxtMenu_ContextMenu';
    menu.style.position = 'fixed';
    menu.style.left = `${windowImpl.innerWidth - 50}px`; // Will overflow right
    menu.style.top = `${windowImpl.innerHeight - 50}px`; // Will overflow bottom
    menu.style.width = '200px';
    menu.style.height = '100px';

    // Mock getBoundingClientRect to simulate overflow on both axes
    const viewportWidth = windowImpl.innerWidth;
    const viewportHeight = windowImpl.innerHeight;
    menu.getBoundingClientRect = jest.fn(() => ({
      left: viewportWidth - 50,
      top: viewportHeight - 50,
      right: viewportWidth + 150, // Overflows right
      bottom: viewportHeight + 50, // Overflows bottom
      width: 200,
      height: 100,
      x: viewportWidth - 50,
      y: viewportHeight - 50,
      toJSON: () => {},
    }));

    document.body.appendChild(menu);
    await waitForObserver();

    // Menu should be repositioned to prevent overflow on both axes
    const newLeft = parseInt(menu.style.left, 10);
    const newTop = parseInt(menu.style.top, 10);
    const menuRight = newLeft + 200; // width
    const menuBottom = newTop + 100; // height
    expect(menuRight).toBeLessThanOrEqual(window.innerWidth - 10);
    expect(menuBottom).toBeLessThanOrEqual(window.innerHeight - 10);
  });

  it('does not reposition menu if within viewport', async() => {
    if (!document || !window) {
      expect(document).toBeTruthy();
      expect(window).toBeTruthy();
      return;
    }

    cleanup = initializeMathJaxMenuPositioning(window);

    // Create menu that is well within viewport
    const menu = document.createElement('div');
    menu.className = 'CtxtMenu_ContextMenu';
    menu.style.position = 'fixed';
    menu.style.left = '100px';
    menu.style.top = '100px';
    menu.style.width = '200px';
    menu.style.height = '100px';

    document.body.appendChild(menu);
    await waitForObserver();

    // Menu should NOT be repositioned
    expect(menu.style.left).toBe('100px');
    expect(menu.style.top).toBe('100px');
  });

  it('handles menus added as children of new elements', async() => {
    if (!document || !window) {
      expect(document).toBeTruthy();
      expect(window).toBeTruthy();
      return;
    }

    const windowImpl = window;
    cleanup = initializeMathJaxMenuPositioning(windowImpl);

    // Create container with menu as child
    const container = document.createElement('div');
    const menu = document.createElement('div');
    menu.className = 'CtxtMenu_ContextMenu';
    menu.style.position = 'fixed';
    menu.style.left = `${windowImpl.innerWidth - 50}px`;
    menu.style.top = '100px';
    menu.style.width = '200px';
    menu.style.height = '100px';

    // Mock getBoundingClientRect to simulate overflow
    const viewportWidth = windowImpl.innerWidth;
    menu.getBoundingClientRect = jest.fn(() => ({
      left: viewportWidth - 50,
      top: 100,
      right: viewportWidth + 150, // Overflows by 150px
      bottom: 200,
      width: 200,
      height: 100,
      x: viewportWidth - 50,
      y: 100,
      toJSON: () => {},
    }));

    container.appendChild(menu);
    document.body.appendChild(container);
    await waitForObserver();

    // Menu should still be repositioned even though it was added as part of container
    const newLeft = parseInt(menu.style.left, 10);
    const menuRight = newLeft + 200; // width
    expect(menuRight).toBeLessThanOrEqual(window.innerWidth - 10);
  });

  it('cleans up observer when cleanup function is called', async() => {
    if (!document || !window) {
      expect(document).toBeTruthy();
      expect(window).toBeTruthy();
      return;
    }

    cleanup = initializeMathJaxMenuPositioning(window);

    // Call cleanup
    cleanup();
    cleanup = undefined;

    // Add menu after cleanup - should NOT be repositioned
    const menu = document.createElement('div');
    menu.className = 'CtxtMenu_ContextMenu';
    menu.style.position = 'fixed';
    menu.style.left = `${window.innerWidth - 50}px`;
    menu.style.top = '100px';
    menu.style.width = '200px';
    menu.style.height = '100px';

    document.body.appendChild(menu);
    await waitForObserver();

    // Observer was disconnected, so menu should NOT be repositioned
    const left = parseInt(menu.style.left, 10);
    const menuRight = left + 200; // width
    expect(menuRight).toBeGreaterThan(window.innerWidth - 10); // Still overflows
  });
});
