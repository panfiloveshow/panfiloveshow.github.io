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

const sitemap = await readFile(join(DIST_DIR, 'sitemap.xml'), 'utf8');
const urlList = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);

if (!urlList.length) throw new Error('В sitemap.xml не найдено URL для IndexNow');
if (urlList.length > 10_000) throw new Error('IndexNow принимает не более 10 000 URL за запрос');
if (urlList.some((url) => !url.startsWith(`${SITE_ORIGIN}/`))) {
  throw new Error('sitemap.xml содержит URL другого host');
}

const payload = {
  host: SITE_HOST,
  key,
  keyLocation: `${SITE_ORIGIN}/indexnow-key.txt`,
  urlList,
};

if (DRY_RUN) {
  console.log(`IndexNow dry-run: ${urlList.length} URL, keyLocation=${payload.keyLocation}`);
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
