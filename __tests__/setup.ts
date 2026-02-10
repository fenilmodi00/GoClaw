import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeEach, vi } from 'vitest';

// Mock DOM APIs that jsdom doesn't fully support
beforeEach(() => {
  // Check if Element is defined (jsdom should be initialized)
  if (typeof Element !== 'undefined') {
    // Mock hasPointerCapture for Radix UI
    if (typeof Element.prototype.hasPointerCapture === 'undefined') {
      Element.prototype.hasPointerCapture = vi.fn().mockReturnValue(false);
    }
    if (typeof Element.prototype.setPointerCapture === 'undefined') {
      Element.prototype.setPointerCapture = vi.fn();
    }
    if (typeof Element.prototype.releasePointerCapture === 'undefined') {
      Element.prototype.releasePointerCapture = vi.fn();
    }
    if (typeof Element.prototype.scrollIntoView === 'undefined') {
      Element.prototype.scrollIntoView = vi.fn();
    }
  }
});

// Cleanup after each test
afterEach(() => {
  cleanup();
});
