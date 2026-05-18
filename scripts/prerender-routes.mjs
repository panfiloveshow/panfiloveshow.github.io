import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';

const indexPath = join('dist', 'index.html');
const indexHtml = await readFile(indexPath, 'utf8');

const routes = [
  {
    path: 'privacy',
    title: 'Политика обработки персональных данных — Sellico',
    description:
      'Политика Sellico: какие персональные данные и cookies обрабатываются, цели, правовые основания, сроки хранения и права пользователя.',
    canonical: 'https://sellico.ru/privacy',
    h1: 'Политика обработки персональных данных',
    lead:
      'Документ описывает, какие данные обрабатывает Sellico, зачем они нужны, как хранятся и как пользователь может отозвать согласие.',
  },
  {
    path: 'personal-data-consent',
    title: 'Согласие на обработку персональных данных — Sellico',
    description:
      'Согласие пользователя Sellico на обработку персональных данных: перечень данных, цели обработки, срок действия и порядок отзыва.',
    canonical: 'https://sellico.ru/personal-data-consent',
    h1: 'Согласие на обработку персональных данных',
    lead:
      'Документ фиксирует согласие пользователя на обработку данных для заявки, подключения, коммуникации и работы сервиса Sellico.',
  },
];

function escapeHtml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function replaceMeta(html, route) {
  let next = html;
  next = next.replace(/<title>.*?<\/title>/, `<title>${escapeHtml(route.title)}</title>`);
  next = next.replace(
    /<meta\s+name="description"\s+content="[^"]*"\s*\/>/,
    `<meta name="description" content="${escapeHtml(route.description)}" />`,
  );
  next = next.replace(
    /<meta\s+property="og:url"\s+content="[^"]*"\s*\/>/,
    `<meta property="og:url" content="${route.canonical}" />`,
  );
  next = next.replace(
    /<meta\s+property="og:title"\s+content="[^"]*"\s*\/>/,
    `<meta property="og:title" content="${escapeHtml(route.title)}" />`,
  );
  next = next.replace(
    /<meta\s+property="og:description"\s+content="[^"]*"\s*\/>/,
    `<meta property="og:description" content="${escapeHtml(route.description)}" />`,
  );
  next = next.replace(
    /<meta\s+name="twitter:title"\s+content="[^"]*"\s*\/>/,
    `<meta name="twitter:title" content="${escapeHtml(route.title)}" />`,
  );
  next = next.replace(
    /<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/>/,
    `<meta name="twitter:description" content="${escapeHtml(route.description)}" />`,
  );
  next = next.replace(
    /<link\s+rel="canonical"\s+href="[^"]*"\s*\/>/,
    `<link rel="canonical" href="${route.canonical}" />`,
  );
  next = next.replace(
    '<div id="root"></div>',
    `<div id="root"><main><section style="max-width:960px;margin:0 auto;padding:120px 24px 64px;font-family:Inter,system-ui,sans-serif;color:#090E17"><p style="margin:0 0 12px;color:#177357;font-weight:700;letter-spacing:.12em;text-transform:uppercase;font-size:12px">Sellico</p><h1 style="margin:0;font-size:42px;line-height:1.05">${escapeHtml(route.h1)}</h1><p style="max-width:720px;margin:24px 0 0;color:#3D5482;font-size:18px;line-height:1.7">${escapeHtml(route.lead)}</p></section></main></div>`,
  );
  return next;
}

for (const route of routes) {
  const outputPath = join('dist', route.path, 'index.html');
  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, replaceMeta(indexHtml, route));
}

console.log(`prerendered ${routes.length} route(s)`);
