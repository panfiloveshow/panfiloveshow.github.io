import assert from 'node:assert/strict';
import { nextLastmod } from './build-content-index.mjs';

const base = { lastmod: '2026-08-25', today: '2026-09-22' };
assert.equal(nextLastmod({ ...base, prevHash: 'a', hash: 'a' }), '2026-08-25', 'контент не менялся');
assert.equal(nextLastmod({ ...base, prevHash: 'a', hash: 'b' }), '2026-09-22', 'контент изменился');
assert.equal(nextLastmod({ ...base, prevHash: undefined, hash: 'b' }), '2026-08-25', 'первая сборка');
assert.equal(nextLastmod({ ...base, lastmod: '2026-09-22', prevHash: 'a', hash: 'b' }), '2026-09-22', 'уже сегодня');
console.log('lastmod: ok');
