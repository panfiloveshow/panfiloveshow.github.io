// Проверка внутренних ссылок в собранном dist: каждая должна вести на существующий файл.
// Запуск: pnpm check:links (выполняется и в конце сборки).
import { readdir, readFile, stat } from 'node:fs/promises';
import { join, relative } from 'node:path';

const DIST = 'dist';

async function htmlFiles(dir) {
  const found = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) found.push(...(await htmlFiles(path)));
    else if (entry.name.endsWith('.html')) found.push(path);
  }
  return found;
}

async function exists(path) {
  try {
    const info = await stat(path);
    return info.isDirectory() ? exists(join(path, 'index.html')) : true;
  } catch {
    return false;
  }
}

const broken = [];
let checked = 0;

for (const file of await htmlFiles(DIST)) {
  const html = await readFile(file, 'utf8');
  const hrefs = [...html.matchAll(/href="([^"]+)"/g)].map((match) => match[1]);

  for (const href of new Set(hrefs)) {
    // /api/ отдаёт бэкенд, а не dist (на главной — preload запроса промо-баннеров)
    if (!href.startsWith('/') || href.startsWith('//') || href.startsWith('/api/')) continue;
    const path = href.split('#')[0].split('?')[0];
    if (path === '/' || path === '') continue;
    checked += 1;
    if (!(await exists(join(DIST, path)))) broken.push([relative(DIST, file), href]);
  }
}

if (broken.length) {
  console.error(`Битые внутренние ссылки (${broken.length}):`);
  for (const [file, href] of broken) console.error(`  ${file} → ${href}`);
  process.exit(1);
}

console.log(`ссылки: ${checked} внутренних, битых нет`);
