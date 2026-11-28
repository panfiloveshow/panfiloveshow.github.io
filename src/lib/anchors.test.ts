import assert from 'node:assert/strict';
import { scrollToSection, scrollToHashOnReady } from './anchors.ts';

let top = 3000;
let calls = 0;
let nextFrame: (() => void) | undefined;
let resized: (() => void) | undefined;
const listeners = new Map<string, () => void>();
const timers: (() => void)[] = [];
const target = {
  getBoundingClientRect: () => ({ top }),
  scrollIntoView: () => { calls++; top = 176; },
};
Object.assign(globalThis, {
  document: { getElementById: (id: string) => id === 'pricing' ? target : null, body: {}, documentElement: {} },
  window: {
    location: { hash: '#pricing', href: '' },
    requestAnimationFrame: (callback: () => void) => { nextFrame = callback; return 1; },
    cancelAnimationFrame: () => {},
    getComputedStyle: () => ({ scrollMarginTop: '96px', scrollPaddingTop: '80px' }),
    setTimeout: (callback: () => void) => { timers.push(callback); return timers.length; },
    clearTimeout: () => {},
    addEventListener: (name: string, callback: () => void) => listeners.set(name, callback),
    removeEventListener: (name: string) => listeners.delete(name),
  },
  ResizeObserver: class {
    constructor(callback: () => void) { resized = callback; }
    observe() {}
    disconnect() {}
  },
});

// A menu click must still reach pricing after preceding lazy sections grow.
scrollToSection('pricing');
nextFrame!();
assert.equal(top, 176);
timers[0]();
assert.equal(calls, 1, 'A correctly aligned section must not be scrolled again');
top = 3500;
resized!();
nextFrame!();
assert.equal(top, 176);
assert.equal(calls, 2);
listeners.get('wheel')!();
top = 200;
timers[0]();
assert.equal(top, 200, 'User scrolling must cancel automatic alignment');

const stop = scrollToHashOnReady();
nextFrame!();
assert.equal(top, 176);
stop();
scrollToSection('missing');
assert.equal(window.location.href, '/#missing');
console.log('anchors: ok');
