import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

const SITE_HOST = 'sellico.ru';
const SITE_ORIGIN = `https://${SITE_HOST}`;
const DIST_DIR = process.env.INDEXNOW_DIST_DIR ?? 'dist';
const ENDPOINT = process.env.INDEXNOW_ENDPOINT ?? 'https://api.indexnow.org/indexnow';
const DRY_RUN = process.env.INDEXNOW_DRY_RUN === '1';

const key = (await readFile(join(DIST_DIR, 'indexnow-key.txt'), 'utf8')).trim();
if (!/^[a-zA-Z0-9-]{8,128}$/.test(key)) {
  throw new Error('IndexNow key должен содержать 8–128 латинских букв, цифр или дефисов');
}

const lastmods = (xml) =>
  new Map([...xml.matchAll(/<loc>([^<]+)<\/loc>\s*<lastmod>([^<]*)<\/lastmod>/g)].map((m) => [m[1], m[2]]));

const current = lastmods(await readFile(join(DIST_DIR, 'sitemap.xml'), 'utf8'));
if (!current.size) throw new Error('В sitemap.xml не найдено URL для IndexNow');
if ([...current.keys()].some((url) => !url.startsWith(`${SITE_ORIGIN}/`))) {
  throw new Error('sitemap.xml содержит URL другого host');
}

// Шлём только новые, изменившиеся (другой lastmod) и удалённые URL: переотправка всех страниц
// на каждом деплое — шум для IndexNow. Прежний sitemap deploy.sh снимает с прода до rsync;
// если его нет или он пустой — отправляем всё, как раньше.
const previous = process.env.INDEXNOW_PREV_SITEMAP
  ? lastmods(await readFile(process.env.INDEXNOW_PREV_SITEMAP, 'utf8').catch(() => ''))
  : new Map();
const urlList = previous.size
  ? [
      ...[...current].filter(([url, lastmod]) => previous.get(url) !== lastmod).map(([url]) => url),
      ...[...previous.keys()].filter((url) => !current.has(url) && url.startsWith(`${SITE_ORIGIN}/`)),
    ]
  : [...current.keys()];

if (!urlList.length) {
  console.log('IndexNow: изменённых URL нет, отправка не нужна');
  process.exit(0);
}
if (urlList.length > 10_000) throw new Error('IndexNow принимает не более 10 000 URL за запрос');

const payload = {
  host: SITE_HOST,
  key,
  keyLocation: `${SITE_ORIGIN}/indexnow-key.txt`,
  urlList,
};

if (DRY_RUN) {
  console.log(`IndexNow dry-run: ${urlList.length} URL, keyLocation=${payload.keyLocation}\n${urlList.join('\n')}`);
  process.exit(0);
}

const response = await fetch(ENDPOINT, {
  method: 'POST',
  headers: { 'content-type': 'application/json; charset=utf-8' },
  body: JSON.stringify(payload),
  signal: AbortSignal.timeout(15_000),
});

if (![200, 202].includes(response.status)) {
  const body = (await response.text()).slice(0, 500);
  throw new Error(`IndexNow вернул HTTP ${response.status}${body ? `: ${body}` : ''}`);
}

console.log(`IndexNow: принято ${urlList.length} URL (HTTP ${response.status})`);
