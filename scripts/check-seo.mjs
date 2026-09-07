import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { routes } from './site-routes.mjs';

const failures = [];
const titles = new Map();
const descriptions = new Map();

function fail(message) {
  failures.push(message);
}

function oneMatch(html, pattern) {
  return html.match(pattern)?.[1]?.trim() ?? '';
}

function jsonLdNodes(html, path) {
  const nodes = [];
  for (const match of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try {
      const value = JSON.parse(match[1]);
      nodes.push(...(Array.isArray(value['@graph']) ? value['@graph'] : [value]));
    } catch (error) {
      fail(`${path}: JSON-LD не парсится (${error.message})`);
    }
  }
  return nodes;
}

const pages = [{ path: '', canonical: 'https://sellico.ru/', kind: 'home' }, ...routes];

for (const page of pages) {
  const file = page.path ? join('dist', page.path, 'index.html') : join('dist', 'index.html');
  const html = await readFile(file, 'utf8');
  const label = page.path ? `/${page.path}/` : '/';

  const title = oneMatch(html, /<title>([\s\S]*?)<\/title>/);
  const description = oneMatch(html, /<meta\s+name="description"\s+content="([^"]*)"\s*\/>/);
  const canonical = oneMatch(html, /<link\s+rel="canonical"\s+href="([^"]*)"\s*\/>/);
  const h1Count = (html.match(/<h1(?:\s|>)/g) ?? []).length;

  if (!title) fail(`${label}: нет title`);
  if (!description) fail(`${label}: нет description`);
  if (title.length > 60) fail(`${label}: title длиннее 60 символов (${title.length})`);
  if (description.length > 160) fail(`${label}: description длиннее 160 символов (${description.length})`);
  if (canonical !== page.canonical) fail(`${label}: canonical ${canonical || 'отсутствует'} вместо ${page.canonical}`);
  if (h1Count !== 1) fail(`${label}: найдено H1 — ${h1Count}`);
  if (html.includes('https://www.sellico.ru')) fail(`${label}: найден неканонический www URL`);

  if (titles.has(title)) fail(`${label}: title дублирует ${titles.get(title)}`);
  else titles.set(title, label);
  if (descriptions.has(description)) fail(`${label}: description дублирует ${descriptions.get(description)}`);
  else descriptions.set(description, label);

  const nodes = jsonLdNodes(html, label);
  if (!nodes.length) fail(`${label}: нет валидного JSON-LD`);

  if (page.kind !== 'home' && page.kind !== 'legal') {
    if (!html.includes('Редакционная информация')) fail(`${label}: нет видимой редакционной информации`);
    const webPage = nodes.find((node) => node['@id'] === `${page.canonical}#webpage`);
    if (!webPage?.author) fail(`${label}: в WebPage нет author`);
    if (webPage?.author?.['@id'] !== 'https://sellico.ru/authors/danil-zubarev/#person') {
      fail(`${label}: WebPage не связан с профилем автора`);
    }
    if (!nodes.some((node) => node['@id'] === 'https://sellico.ru/authors/danil-zubarev/#person')) {
      fail(`${label}: нет Person автора в JSON-LD графе`);
    }
    if (!Array.isArray(webPage?.citation) || !webPage.citation.length) fail(`${label}: в WebPage нет citation`);
    // Google требует дату со временем — сверяем дату, а не строку целиком.
    if (webPage?.dateModified !== `${page.lastmod}T00:00:00+03:00`) {
      fail(`${label}: dateModified не совпадает с lastmod или отдан без времени`);
    }
    if (webPage?.isPartOf?.['@id'] !== 'https://sellico.ru/#website') fail(`${label}: WebPage не связан с WebSite`);
    if (!nodes.some((node) => node['@id'] === 'https://sellico.ru/#website')) fail(`${label}: нет WebSite в JSON-LD графе`);
    if (page.faq && !webPage?.hasPart?.some((node) => node['@id'] === `${page.canonical}#faq`)) {
      fail(`${label}: FAQPage не связан с WebPage`);
    }
    if (page.answer) {
      const words = page.answer.text.trim().split(/\s+/).length;
      if (words < 35 || words > 70) fail(`${label}: короткий ответ содержит ${words} слов вместо 35–70`);
      if (!html.includes('data-direct-answer')) fail(`${label}: короткий ответ отсутствует в видимом HTML`);
      if (!html.includes(page.answer.title)) fail(`${label}: заголовок короткого ответа отсутствует в HTML`);
      if (webPage?.abstract !== page.answer.text) fail(`${label}: короткий ответ не совпадает с WebPage.abstract`);
      if (!Array.isArray(page.answer.points) || page.answer.points.length !== 3) {
        fail(`${label}: короткий ответ должен содержать три проверяемых тезиса`);
      }
    }
  }

  const markdownAlternate = html.includes('rel="alternate" type="text/markdown"');
  if (page.kind === 'pricing' && !markdownAlternate) fail(`${label}: нет Markdown-alternate тарифов`);
  if (page.kind !== 'pricing' && markdownAlternate) fail(`${label}: чужой Markdown ошибочно указан как alternate`);

  if (page.kind === 'glossary' && !nodes.some((node) => node['@type'] === 'DefinedTerm')) {
    fail(`${label}: термин глоссария не размечен DefinedTerm`);
  }
  if (page.kind === 'author' && !nodes.some((node) => node['@type'] === 'ProfilePage')) {
    fail(`${label}: профиль автора не размечен ProfilePage`);
  }
  if (page.kind === 'cases') {
    if (!nodes.some((node) => node['@id'] === `${page.canonical}#scenarios` && node['@type'] === 'ItemList')) {
      fail(`${label}: модельные сценарии не размечены ItemList`);
    }
    if (nodes.some((node) => ['Review', 'AggregateRating'].includes(node['@type']))) {
      fail(`${label}: модельным сценариям ошибочно присвоены Review/AggregateRating`);
    }
  }
}

const sitemap = await readFile(join('dist', 'sitemap.xml'), 'utf8');
const sitemapUrls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
const expectedUrls = pages.map((page) => page.canonical);
if (sitemapUrls.some((url) => url.endsWith('.md'))) fail('sitemap.xml: Markdown не должен индексироваться отдельно');
if (new Set(sitemapUrls).size !== sitemapUrls.length) fail('sitemap.xml: есть дубли URL');
for (const url of expectedUrls) {
  if (!sitemapUrls.includes(url)) fail(`sitemap.xml: отсутствует ${url}`);
}
for (const url of sitemapUrls) {
  if (!expectedUrls.includes(url)) fail(`sitemap.xml: лишний URL ${url}`);
}

const robots = await readFile(join('dist', 'robots.txt'), 'utf8');
for (const bot of [
  'OAI-SearchBot',
  'ChatGPT-User',
  'GPTBot',
  'PerplexityBot',
  'Perplexity-User',
  'Claude-SearchBot',
  'Claude-User',
  'ClaudeBot',
  'Google-Extended',
  'bingbot',
]) {
  if (!robots.includes(`User-agent: ${bot}`)) fail(`robots.txt: нет правила для ${bot}`);
}
if (!robots.includes('Disallow: /crm/')) fail('robots.txt: CRM не закрыт');
if (robots.indexOf('User-agent: OAI-SearchBot') < robots.lastIndexOf('Clean-param:')) {
  fail('robots.txt: AI-группа разрывает wildcard-группу с Clean-param');
}

const notFound = await readFile(join('dist', '404.html'), 'utf8');
if (!/noindex/i.test(notFound)) fail('404.html: нет noindex');

const pricingMarkdown = await readFile(join('dist', 'pricing.md'), 'utf8');
if (!pricingMarkdown.includes('Каноническая HTML-страница: https://sellico.ru/pricing/')) {
  fail('pricing.md: не указан канонический HTML URL');
}

const indexNowKey = (await readFile(join('dist', 'indexnow-key.txt'), 'utf8')).trim();
if (!/^[a-zA-Z0-9-]{8,128}$/.test(indexNowKey)) fail('indexnow-key.txt: ключ имеет неверный формат');
if (sitemap.includes('indexnow-key.txt')) fail('sitemap.xml: технический ключ IndexNow не должен индексироваться');

const llmsFull = await readFile(join('dist', 'llms-full.txt'), 'utf8');
if (!llmsFull.includes('Last updated: 2026-08-25')) fail('llms-full.txt: устарела дата обновления');

const landingHtml = await readFile(join('dist', 'index.html'), 'utf8');
if (!landingHtml.includes('https://sellico.ru/og-image-v2.jpg')) fail('index.html: не подключено исправленное OG-изображение');
if (landingHtml.includes('https://sellico.ru/og-image.png')) fail('index.html: осталось повреждённое OG-изображение');

if (failures.length) {
  console.error(`SEO-проверка: ${failures.length} проблем(ы)\n- ${failures.join('\n- ')}`);
  process.exitCode = 1;
} else {
  console.log(`SEO-проверка: ${pages.length} HTML-страниц, sitemap, robots, JSON-LD и AI-файлы — OK`);
}
