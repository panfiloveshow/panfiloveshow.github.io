// Собирает компактный индекс страниц из src/content/pages/**.
// Индекс грузится сразу (нужен для title, description и canonical), а тело страницы —
// отдельным чанком по требованию: иначе посетитель одной страницы качает контент всех.
import { createHash } from 'node:crypto';
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join, relative } from 'node:path';

const PAGES_DIR = join('src', 'content', 'pages');
const HASHES_PATH = join('scripts', 'content-hashes.json');

async function pageFiles() {
  const files = [];
  const walk = async (dir) => {
    for (const entry of await readdir(dir, { withFileTypes: true })) {
      const path = join(dir, entry.name);
      if (entry.isDirectory()) await walk(path);
      else if (entry.name.endsWith('.json')) files.push(path);
    }
  };
  await walk(PAGES_DIR);
  return files.sort();
}

const slugOf = (file) => relative(PAGES_DIR, file).replace(/\\/g, '/').replace(/\.json$/, '');

export async function readPages() {
  const pages = {};
  for (const file of await pageFiles()) {
    pages[slugOf(file)] = JSON.parse(await readFile(file, 'utf8'));
  }
  return pages;
}

// Дата страницы — сегодня, если её содержимое изменилось с прошлой сборки; иначе прежняя.
// Без прежнего хеша (первая сборка) дату не трогаем: только запоминаем текущее состояние.
export function nextLastmod({ lastmod, prevHash, hash, today }) {
  return prevHash && prevHash !== hash && lastmod < today ? today : lastmod;
}

// Раньше lastmod правили руками и забывали: страница менялась, а sitemap, dateModified
// и «Обновлено» показывали старую дату. Теперь дата поднимается сама прямо в JSON страницы —
// его же читают и React, и пререндер. Хеш считается по содержимому без lastmod.
async function bumpChangedLastmods() {
  const hashes = JSON.parse(await readFile(HASHES_PATH, 'utf8').catch(() => '{}'));
  const today = new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Moscow' });
  const bumped = [];
  for (const file of await pageFiles()) {
    const slug = slugOf(file);
    const text = await readFile(file, 'utf8');
    const { lastmod, ...content } = JSON.parse(text);
    const hash = createHash('sha1').update(JSON.stringify(content)).digest('hex');
    const next = nextLastmod({ lastmod, prevHash: hashes[slug], hash, today });
    if (next !== lastmod) {
      await writeFile(file, text.replace(/"lastmod":\s*"[^"]*"/, `"lastmod": "${next}"`));
      bumped.push(slug);
    }
    hashes[slug] = hash;
  }
  await writeFile(HASHES_PATH, `${JSON.stringify(hashes, null, 2)}\n`);
  return bumped;
}

// Путь проекта содержит кириллицу: import.meta.url её процентно кодирует, а argv[1] — нет,
// поэтому сравниваем по имени файла, а не по полному URL.
if (process.argv[1]?.endsWith('build-content-index.mjs')) {
  const bumped = await bumpChangedLastmods();
  if (bumped.length) console.log(`lastmod обновлён (изменился контент): ${bumped.join(', ')}`);

  const pages = await readPages();
  const index = Object.fromEntries(
    Object.entries(pages).map(([slug, page]) => [
      slug,
      {
        kind: page.kind,
        lastmod: page.lastmod,
        eyebrow: page.eyebrow,
        title: page.title,
        description: page.description,
      },
    ]),
  );
  await writeFile(join('src', 'content', 'pages-index.json'), `${JSON.stringify(index, null, 2)}\n`);
  console.log(`индекс контента: ${Object.keys(index).length} страниц`);
}
