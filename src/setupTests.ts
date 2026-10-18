import { vi } from 'vitest';
import 'fake-indexeddb/auto';

// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

const dialogPrototype = window.HTMLDialogElement?.prototype;
if (dialogPrototype) {
  if (typeof dialogPrototype.showModal !== 'function') {
    Object.defineProperty(dialogPrototype, 'showModal', {
      configurable: true,
      writable: true,
      value: function showModal(this: HTMLDialogElement) {
        this.setAttribute('open', '');
      },
    });
  }

  if (typeof dialogPrototype.close !== 'function') {
    Object.defineProperty(dialogPrototype, 'close', {
      configurable: true,
      writable: true,
      value: function close(this: HTMLDialogElement, returnValue?: string) {
        if (returnValue !== undefined) {
          this.returnValue = returnValue;
        }
        this.removeAttribute('open');
        this.dispatchEvent(new Event('close'));
      },
    });
  }
}

// jsdom does not implement scrollIntoView; AccessibleList calls it when the
// active option changes, so stub it to a no-op for any listbox-based test.
if (typeof Element.prototype.scrollIntoView !== 'function') {
  Element.prototype.scrollIntoView = vi.fn();
}

// Mock BroadcastChannel
global.BroadcastChannel = vi.fn().mockImplementation(() => ({
  postMessage: vi.fn(),
  onmessage: null,
  close: vi.fn(),
}));

// Mock localStorage
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: vi.fn(() => null),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
    length: 0,
    key: vi.fn(),
  },
  writable: true,
});

// Mock window.open
Object.defineProperty(window, 'open', {
  value: vi.fn(),
  writable: true,
});
