import assert from 'node:assert/strict';
import { bannerUrl, parseHeroBanners } from './hero-banners.ts';

const hero = { id: 1, format: 'hero', image: '/storage/promo-banners/square.webp', image_mobile: null, link: '/register', alt: 'Новый баннер' };
assert.deepEqual(parseHeroBanners({ data: [hero] }), [hero]);
assert.deepEqual(parseHeroBanners([hero]), [hero]);
for (const payload of [null, {}, '<!DOCTYPE html>', { data: null }]) assert.deepEqual(parseHeroBanners(payload), []);
assert.deepEqual(parseHeroBanners({ data: [{ ...hero, format: 'strip' }, { ...hero, format: undefined }] }), []);
assert.deepEqual(parseHeroBanners({ data: [null, { ...hero, image: 'javascript:alert(1)' }, hero, hero] }), [hero]);
const unsafe = ['javascript:alert(1)', 'data:image/svg+xml,test', '//evil.example', '/\\evil.example', 'https://user:password@example.com', '/\nevil', 'file:///tmp/poster.png'];
for (const url of unsafe) assert.equal(bannerUrl(url), null, url);
for (const url of ['/register', '/storage/banner.webp', 'https://sellico.ru/register', 'http://127.0.0.1:8000/storage/a.webp']) assert.equal(bannerUrl(url), url);
assert.equal(parseHeroBanners([{ ...hero, link: 'javascript:alert(1)', image_mobile: '//evil.example', alt: '' }])[0].link, null);
assert.equal(parseHeroBanners([{ ...hero, image_mobile: '//evil.example', alt: '' }])[0].image_mobile, null);
assert.equal(parseHeroBanners([{ ...hero, alt: '' }])[0].alt, 'Промо-баннер Sellico');
console.log('Hero banner contract: passed');
