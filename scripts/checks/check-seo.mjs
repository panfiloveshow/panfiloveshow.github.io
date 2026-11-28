import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { routes } from '../build/site-routes.mjs';

const failures = [];
const titles = new Map();
const descriptions = new Map();

function fail(message) {
  failures.push(message);
}

function oneMatch(html, pattern) {
  return html.match(pattern)?.[1]?.trim() ?? '';
}

const normalizeText = (text) => text.replace(/\s+/g, ' ').trim();

function visibleText(html) {
  const body = html.match(/<body\b[^>]*>([\s\S]*?)<\/body>/i)?.[1] ?? '';
  const entities = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', '#39': "'" };
  return normalizeText(body
    .replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&(amp|lt|gt|quot|apos|nbsp|#39);/g, (_match, name) => entities[name]));
}

function checkSchemaContent(nodes, html, label) {
  const text = visibleText(html);
  for (const node of nodes) {
    if (node['@id'] === 'https://sellico.ru/#organization') {
      for (const field of ['streetAddress', 'addressLocality', 'postalCode', 'addressCountry']) {
        if (typeof node.address?.[field] !== 'string' || !node.address[field].trim()) {
          fail(`${label}: адрес организации не содержит ${field}`);
        }
      }
    }
    if (node['@type'] === 'FAQPage') {
      if (!Array.isArray(node.mainEntity) || !node.mainEntity.length) fail(`${label}: FAQPage пуст`);
      for (const question of node.mainEntity ?? []) {
        if (!question.name || !text.includes(normalizeText(question.name))) fail(`${label}: FAQ-вопрос отсутствует в HTML: ${question.name}`);
        const answer = question.acceptedAnswer?.text;
        if (!answer || !text.includes(normalizeText(answer))) fail(`${label}: FAQ-ответ отличается от HTML: ${question.name}`);
      }
    }
    if (['SoftwareApplication', 'WebApplication'].includes(node['@type']) && !node.aggregateRating && !node.review) {
      fail(`${label}: разметка приложения без рейтинга или отзыва снова создаёт предупреждение Google; используйте Service или WebPage`);
    }
    if (node['@type'] === 'Service') {
      if (node.provider?.['@id'] !== 'https://sellico.ru/#organization') fail(`${label}: не указан оператор услуги`);
      const catalog = node.hasOfferCatalog;
      const offers = Array.isArray(catalog?.itemListElement) ? catalog.itemListElement : [];
      if (catalog?.['@type'] !== 'OfferCatalog' || !offers.length) fail(`${label}: у услуги нет каталога тарифов`);
      for (const offer of offers) {
        if (offer?.['@type'] !== 'Offer') {
          fail(`${label}: предложение услуги должно иметь тип Offer с явной ценой или нижней границей`);
          continue;
        }
        const price = offer.price;
        const minimum = offer.priceSpecification?.minPrice;
        const amount = price ?? minimum;
        if (amount === undefined || !Number.isFinite(Number(amount)) || Number(amount) < 0) fail(`${label}: недопустимая цена предложения`);
        if (offer.priceCurrency !== 'RUB') fail(`${label}: отсутствует валюта RUB`);
        if (offer.priceSpecification) {
          const types = [offer.priceSpecification['@type']].flat();
          if (!types.includes('PriceSpecification')) fail(`${label}: priceSpecification не объявляет тип PriceSpecification`);
        }
        if (offer.name === 'Enterprise' && (price !== undefined || minimum !== 40000 || offer.priceSpecification?.price !== undefined)) {
          fail(`${label}: Enterprise должен объявлять minPrice 40000, а не фиксированную цену`);
        }
      }
    }
    if (node['@type'] === 'HowTo') {
      fail(`${label}: тип HowTo устарел в Google Search с сентября 2023; используйте семантические списки в HTML без HowTo JSON-LD`);
    }
  }
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

  for (const [, attrs] of html.matchAll(/<img\b([^>]*)>/gi)) {
    if (/\balt="\s*"/.test(attrs) && !/\baria-hidden="true"/.test(attrs) && !/\brole="presentation"/.test(attrs)) {
      fail(`${label}: декоративный img с пустым alt должен иметь aria-hidden="true"`);
    }
  }

  const nodes = jsonLdNodes(html, label);
  if (!nodes.length) fail(`${label}: нет валидного JSON-LD`);
  checkSchemaContent(nodes, label === '/' ? html : html, label);
  if (page.kind === 'home') {
    const homePage = nodes.find((node) => node['@id'] === 'https://sellico.ru/#webpage');
    if (!html.includes('data-direct-answer')) fail('/: отсутствует блок прямого ответа data-direct-answer');
    if (typeof homePage?.abstract !== 'string' || homePage.abstract.trim().split(/\s+/).length < 35) {
      fail('/: в WebPage главной отсутствует abstract');
    }
    if (homePage?.speakable?.['@type'] !== 'SpeakableSpecification' || !homePage.speakable.cssSelector?.includes('[data-direct-answer]')) {
      fail('/: в WebPage главной отсутствует SpeakableSpecification');
    }
  }
  if (page.kind === 'calculator') {
    const calculatorPage = nodes.find((node) => node['@id'] === `${page.canonical}#webpage`);
    if (calculatorPage?.offers?.['@type'] !== 'Offer' || calculatorPage.offers.price !== 0 || calculatorPage.offers.priceCurrency !== 'RUB') {
      fail(`${label}: у веб-страницы калькулятора нет предложения бесплатного доступа`);
    }
    if (calculatorPage?.isAccessibleForFree !== undefined) fail(`${label}: калькулятор включает парсер платного контента Google`);
  }

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
      if (webPage?.speakable?.['@type'] !== 'SpeakableSpecification' || !webPage.speakable.cssSelector?.includes('[data-direct-answer]')) {
        fail(`${label}: у страницы с коротким ответом отсутствует SpeakableSpecification`);
      }
    }
    if (webPage?.speakable) {
      if (webPage.speakable['@type'] !== 'SpeakableSpecification' || !Array.isArray(webPage.speakable.cssSelector) || !webPage.speakable.cssSelector.length) {
        fail(`${label}: некорректный SpeakableSpecification`);
      }
      for (const selector of webPage.speakable.cssSelector ?? []) {
        const attr = selector.match(/^\[([a-z-]+)\]$/)?.[1];
        if (!attr || !html.includes(attr)) fail(`${label}: селектор speakable ${selector} отсутствует в HTML`);
      }
    }
    if (page.table) {
      const maxCols = page.kind === 'pricing' ? 5 : 4;
      if (!Array.isArray(page.table.columns) || page.table.columns.length < 2 || page.table.columns.length > maxCols) {
        fail(`${label}: таблица должна содержать от 2 до ${maxCols} колонок для AEO-выдачи без обрезки`);
      }
      if (!html.includes('<table') || !html.includes('<th')) fail(`${label}: таблица отсутствует в видимом HTML`);
      if (!html.includes(page.table.title)) fail(`${label}: заголовок таблицы отсутствует в HTML`);
    }
  }

  const markdownAlternate = html.match(/rel="alternate" type="text\/markdown" href="([^"]+)"/)?.[1];
  const expectedMarkdown = page.kind === 'pricing' ? 'https://sellico.ru/pricing.md' : `${label}index.md`;
  if (markdownAlternate !== expectedMarkdown) fail(`${label}: Markdown-alternate не соответствует странице`);

  if (page.kind === 'glossary' && !nodes.some((node) => node['@type'] === 'DefinedTerm')) {
    fail(`${label}: термин глоссария не размечен DefinedTerm`);
  }
  if (page.kind === 'article') {
    const article = nodes.find((node) => node['@type'] === 'Article');
    if (!/^\d{4}-\d{2}-\d{2}T/.test(article?.datePublished ?? '')) fail(`${label}: в Article нет datePublished`);
    if (article?.author?.['@id'] !== 'https://sellico.ru/authors/danil-zubarev/#person') fail(`${label}: Article не связан с автором`);
    const cover = article?.image?.replace('https://sellico.ru/', '') ?? '';
    if (!cover.startsWith('assets/articles/') || !existsSync(join('dist', cover))) fail(`${label}: нет своей обложки ${cover}`);
    if (!html.includes(`<meta property="og:image" content="${article?.image}" />`)) fail(`${label}: og:image не указывает на обложку`);
  }
  if (page.kind === 'author' && !nodes.some((node) => node['@type'] === 'Person' && node.image)) {
    fail(`${label}: у Person автора нет фото (image)`);
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
  if (page.kind === 'compare-hub') {
    const hubNode = nodes.find((node) => node['@id'] === `${page.canonical}#webpage`);
    if (hubNode?.['@type'] !== 'CollectionPage') fail(`${label}: хаб сравнений должен быть CollectionPage`);
    const itemList = nodes.find((node) => node['@id'] === `${page.canonical}#comparisons` && node['@type'] === 'ItemList');
    if (!itemList || !itemList.numberOfItems) fail(`${label}: хаб сравнений не размечен ItemList`);
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
// Яндекс: путь в Clean-param отделяется пробелом; через & он становится именем параметра
if (/^Clean-param:.*&\//m.test(robots)) fail('robots.txt: путь в Clean-param приклеен через &');
// Калькуляторы пишут поля в адрес; поле без Clean-param Яндекс считает отдельной страницей-дублем.
const calcKeys = new Set();
for (const file of ['src/lib/calculators/specs.ts', 'src/components/seo/UnitEconomicsCalculator.tsx']) {
  for (const [, key] of (await readFile(file, 'utf8')).matchAll(/\bkey: '(\w+)'/g)) calcKeys.add(key);
}
const cleanedKeys = new Set(
  [...robots.matchAll(/^Clean-param: (\S+) \/calculators\/$/gm)].flatMap(([, params]) => params.split('&')),
);
const unclean = [...calcKeys].filter((key) => !cleanedKeys.has(key));
if (unclean.length) fail(`robots.txt: поля калькуляторов без Clean-param — ${unclean.join(', ')}`);
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

// Те же правила, что у аудита llms-txt в Lighthouse (Agentic Browsing): Markdown с H1 и ссылками
// вида [текст](url). Голые URL аудит ссылками не считает. Ссылки на сайт — только на живые страницы.
for (const name of ['llms.txt', 'llms-full.txt']) {
  const text = await readFile(join('dist', name), 'utf8');
  if (!/^\s*#\s+.+/m.test(text)) fail(`${name}: нет заголовка H1`);
  if (!/^Last updated: \d{4}-\d{2}-\d{2}$/m.test(text)) fail(`${name}: нет строки «Last updated: ГГГГ-ММ-ДД»`);
  const links = [...text.matchAll(/\[[^\]]+\]\(([^)]+)\)/g)].map((match) => match[1]);
  if (!links.length) fail(`${name}: нет Markdown-ссылок`);
  for (const url of links.filter((link) => link.startsWith('https://sellico.ru/'))) {
    const file = url.slice('https://sellico.ru/'.length);
    if (!sitemapUrls.includes(url) && !['pricing.md', 'llms-full.txt', 'agents.md', 'auth.md', '.well-known/mcp/server-card.json', '.well-known/agent-card.json', '.well-known/oauth-protected-resource', '.well-known/oauth-authorization-server'].includes(file)) {
      fail(`${name}: ссылка на ${url}, которой нет в sitemap`);
    }
  }
}

const landingHtml = await readFile(join('dist', 'index.html'), 'utf8');
if (!landingHtml.includes('https://sellico.ru/og-image-v2.jpg')) fail('index.html: не подключено исправленное OG-изображение');
if (landingHtml.includes('https://sellico.ru/og-image.png')) fail('index.html: осталось повреждённое OG-изображение');

if (failures.length) {
  console.error(`SEO-проверка: ${failures.length} проблем(ы)\n- ${failures.join('\n- ')}`);
  process.exitCode = 1;
} else {
  console.log(`SEO-проверка: ${pages.length} HTML-страниц, sitemap, robots, JSON-LD и AI-файлы — OK`);
}
