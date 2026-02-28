const fs = require('fs');
const code = fs.readFileSync('script.js', 'utf8');

// mock DOM
global.window = {
    scrollY: 0,
    addEventListener: () => { },
    performance: { now: () => 1000 },
    requestAnimationFrame: (cb) => { setTimeout(cb, 16); }
};
global.document = {
    getElementById: (id) => ({ id, style: {}, classList: { add: () => { }, remove: () => { }, contains: () => false, toggle: () => { } }, appendChild: () => { }, addEventListener: () => { }, innerHTML: '' }),
    querySelector: (sel) => ({ className: sel, style: {}, classList: { add: () => { }, remove: () => { }, contains: () => false, toggle: () => { } }, appendChild: () => { }, addEventListener: () => { }, innerHTML: '' }),
    querySelectorAll: () => [],
    createElement: () => ({ style: { setProperty: () => { } }, getContext: () => ({ createImageData: () => ({ data: new Uint8Array(56 * 56 * 4) }), putImageData: () => { }, createRadialGradient: () => ({ addColorStop: () => { } }), save: () => { }, restore: () => { }, beginPath: () => { }, arc: () => { }, clip: () => { }, moveTo: () => { }, lineTo: () => { }, stroke: () => { }, fillRect: () => { }, fill: () => { } }) }),
    body: { style: {}, classList: { add: () => { }, remove: () => { }, contains: () => false, toggle: () => { } }, dataset: {} },
    addEventListener: () => { }
};
global.performance = window.performance;
global.requestAnimationFrame = window.requestAnimationFrame;

global.IntersectionObserver = class { observe() { } unobserve() { } };

try {
    eval(code);
    console.log("No ReferenceErrors executed!");
} catch (e) {
    console.error(e);
}
