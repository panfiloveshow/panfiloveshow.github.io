// Собирает компактный индекс страниц из src/content/pages/**.
// Индекс грузится сразу (нужен для title, description и canonical), а тело страницы —
// отдельным чанком по требованию: иначе посетитель одной страницы качает контент всех.
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join, relative } from 'node:path';

const PAGES_DIR = join('src', 'content', 'pages');

export async function readPages() {
  const files = [];
  const walk = async (dir) => {
    for (const entry of await readdir(dir, { withFileTypes: true })) {
      const path = join(dir, entry.name);
      if (entry.isDirectory()) await walk(path);
      else if (entry.name.endsWith('.json')) files.push(path);
    }
  };
  await walk(PAGES_DIR);

  const pages = {};
  for (const file of files.sort()) {
    const slug = relative(PAGES_DIR, file).replace(/\\/g, '/').replace(/\.json$/, '');
    pages[slug] = JSON.parse(await readFile(file, 'utf8'));
  }
  return pages;
}

// Путь проекта содержит кириллицу: import.meta.url её процентно кодирует, а argv[1] — нет,
// поэтому сравниваем по имени файла, а не по полному URL.
if (process.argv[1]?.endsWith('build-content-index.mjs')) {
  const pages = await readPages();
  const index = Object.fromEntries(
    Object.entries(pages).map(([slug, page]) => [
      slug,
      { kind: page.kind, eyebrow: page.eyebrow, title: page.title, description: page.description },
    ]),
  );
  await writeFile(join('src', 'content', 'pages-index.json'), `${JSON.stringify(index, null, 2)}\n`);
  console.log(`индекс контента: ${Object.keys(index).length} страниц`);
}
