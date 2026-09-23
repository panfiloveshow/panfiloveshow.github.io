import { existsSync } from 'node:fs';
import { mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import {
  editorialPerson,
  landingFaq,
  organization,
  publicPaths,
  routes,
  website,
} from './site-routes.mjs';

const indexPath = join('dist', 'index.html');
const indexHtml = await readFile(indexPath, 'utf8');

// Страница без маршрута в App.tsx отдалась бы статикой, но ломалась при клиентской навигации.
const appSource = await readFile(join('src', 'App.tsx'), 'utf8');
const missingRoutes = routes.filter((route) => !appSource.includes(`'/${route.path}'`));
if (missingRoutes.length) {
  throw new Error(`Нет маршрута в src/App.tsx для: ${missingRoutes.map((r) => r.path).join(', ')}`);
}

// Шрифты грузятся только после разбора CSS — предзагрузка убирает эту задержку. Латиница нужна
// не меньше кириллицы («Sellico», «WILDBERRIES»): без preload её подмена сдвигала вёрстку.
// Имя файла содержит хеш сборки, поэтому подставляем его здесь, а не руками в index.html.
const fontPreload = (await readdir(join('dist', 'assets')))
  .filter((name) => name.startsWith('inter-') && name.endsWith('.woff2'))
  .map((name) => `  <link rel="preload" as="font" type="font/woff2" crossorigin href="/assets/${name}" />\n  `)
  .join('');

function withFontPreload(html) {
  return fontPreload ? html.replace('</head>', `${fontPreload}</head>`) : html;
}

const pageStyles =
  'min-height:100vh;background:#f4f8f6;padding:104px 24px 72px;font-family:Inter,system-ui,sans-serif;color:#101a15';
const containerStyles = 'max-width:1180px;margin:0 auto';

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function injectRoot(html, content) {
  return html.replace('<div id="root"></div>', `<div id="root">${content}</div>`);
}

function staticHeader() {
  return `
    <header style="margin-bottom:18px;display:flex;align-items:center;justify-content:space-between;gap:20px">
      <a href="/" style="display:flex;align-items:center;gap:10px;color:#101a15;font-weight:800;text-decoration:none">
        <img src="/logo.svg" alt="" width="30" height="30"><span>sellico</span>
      </a>
      <nav aria-label="Основная навигация" style="display:flex;flex-wrap:wrap;justify-content:flex-end;gap:14px;font-size:14px">
        <a href="/features/" style="color:#11543f">Возможности</a>
        <a href="/marketplaces/" style="color:#11543f">Маркетплейсы</a>
        <a href="/pricing/" style="color:#11543f">Тарифы</a>
      </nav>
    </header>`;
}

function staticFooter() {
  // В статике подвал раньше содержал две юридические ссылки — до гидрации краулер видел
  // страницу почти без связей. Разделы берём из общей таблицы маршрутов.
  const groups = [
    ['Продукт', ['features', 'analytics-marketplaces', 'unit-economics', 'supply-planning', 'seo-cards', 'advertising', 'reviews', 'team', 'pricing']],
    ['Площадки', ['marketplaces', 'wildberries', 'ozon', 'yandex-market']],
    ['Инструменты', ['calculators', 'calculators/unit-economics', 'calculators/margin', 'calculators/cost-price', 'calculators/roi', 'calculators/abc-xyz', 'calculators/wildberries-logistics', 'calculators/turnover', 'calculators/drr', 'calculators/break-even']],
    ['Справочник', ['glossary', 'glossary/drr', 'glossary/turnover', 'glossary/margin', 'glossary/abc-analysis', 'glossary/fbo-fbs', 'glossary/buyout-rate', 'glossary/roi', 'glossary/conversion', 'glossary/cost-price', 'glossary/xyz-analysis', 'glossary/safety-stock', 'glossary/break-even', 'glossary/cpm-cpc-cpo', 'glossary/lost-sales']],
    ['Компания', ['about', 'authors/danil-zubarev', 'cases', 'methodology', 'contacts']],
  ];
  const byPath = new Map(routes.map((route) => [route.path, route]));

  return `
    <footer style="margin-top:64px;border-top:1px solid #dfe7e2;padding-top:26px;color:#53635b;font-size:13px;line-height:1.6">
      <nav aria-label="Разделы сайта" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:24px;margin-bottom:26px">
        ${groups
          .map(
            ([title, paths]) => `
              <div>
                <p style="margin:0 0 10px;font-weight:700;color:#101a15">${escapeHtml(title)}</p>
                <ul style="margin:0;padding:0;list-style:none">
                  ${paths
                    .filter((path) => byPath.has(path))
                    .map(
                      (path) =>
                        `<li style="margin-bottom:6px"><a href="/${path}/" style="color:#11543f">${escapeHtml(byPath.get(path).eyebrow)}</a></li>`,
                    )
                    .join('')}
                </ul>
              </div>`,
          )
          .join('')}
      </nav>
      <p>© 2026 Sellico · ИП ЗУБАРЕВ ДАНИЛ ВИКТОРОВИЧ · ИНН 644154992160 · hello@sellico.ru</p>
      <p><a href="/privacy/" style="color:#11543f">Политика обработки персональных данных</a> · <a href="/personal-data-consent/" style="color:#11543f">Согласие на обработку данных</a></p>
    </footer>`;
}

function buildLandingFallback() {
  const plans = [
    ['Старт', '3 000 ₽/мес.', '1 API, 3 пользователя, 50 товаров'],
    ['Про', '8 000 ₽/мес.', '3 API, 10 пользователей, 150 товаров'],
    ['Бизнес', '15 000 ₽/мес.', '6 API, 20 пользователей, 300 товаров'],
    ['Enterprise', 'от 40 000 ₽/мес.', 'Договорные лимиты и индивидуальное внедрение'],
  ];
  const features = [
    'Финансы и юнит-экономика по SKU',
    'Остатки, товары и планирование поставок',
    'Реклама, цены и контроль эффективности',
    'SEO-аудит и AI-генерация описаний',
    'Отзывы, заявки и коммуникации',
    'Задачи, календарь и координация команды',
  ];

  return `
    <main id="main-content" style="${pageStyles}">
      <div style="${containerStyles}">
        ${staticHeader()}
        <section style="border:1px solid #dfe7e2;border-radius:28px;background:#0d4d35;padding:clamp(32px,6vw,72px);color:white">
          <h1 style="max-width:900px;margin:0;font-size:clamp(42px,7vw,82px);line-height:.98;letter-spacing:-.055em">
            <span style="display:block;margin:0 0 18px;color:#c8f44d;font-size:12px;font-weight:700;line-height:1.4;letter-spacing:.16em;text-transform:uppercase">Операционная система для продавцов маркетплейсов</span>
            Управляйте прибылью. Не таблицами.
          </h1>
          <p style="max-width:780px;margin:28px 0 0;color:rgba(255,255,255,.8);font-size:18px;line-height:1.65">Sellico объединяет финансы, остатки, рекламу, SEO и задачи команды для Wildberries, Ozon и Яндекс Маркета.</p>
          <p style="margin:30px 0 0"><a href="https://sellico.ru/register" style="display:inline-block;border-radius:12px;background:#c8f44d;padding:15px 22px;color:#123525;font-weight:700;text-decoration:none">Подключить магазин бесплатно</a></p>
        </section>

        <section aria-labelledby="fallback-features-title" style="padding:72px 0 24px">
          <h2 id="fallback-features-title" style="margin:0;font-size:clamp(34px,5vw,58px);letter-spacing:-.045em">Что объединяет Sellico</h2>
          <ul style="display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:14px;margin:28px 0 0;padding:0;list-style:none">
            ${features.map((feature) => `<li style="border:1px solid #dfe7e2;border-radius:18px;background:white;padding:22px;font-size:16px;line-height:1.5">${escapeHtml(feature)}</li>`).join('')}
          </ul>
          <p style="margin:24px 0 0"><a href="/features/" style="color:#11543f;font-weight:700">Подробно о возможностях</a></p>
        </section>

        <section id="pricing" aria-labelledby="fallback-pricing-title" style="padding:64px 0 24px">
          <h2 id="fallback-pricing-title" style="margin:0;font-size:clamp(34px,5vw,58px);letter-spacing:-.045em">Тарифы Sellico</h2>
          <p style="margin:14px 0 0;color:#53635b">3 дня бесплатно, подключение первого магазина примерно за 15 минут, без привязки карты.</p>
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:14px;margin-top:28px">
            ${plans
              .map(
                ([name, price, limits]) => `
                  <article style="border:1px solid #dfe7e2;border-radius:20px;background:white;padding:24px">
                    <h3 style="margin:0;color:#177357;font-size:15px;text-transform:uppercase;letter-spacing:.12em">${escapeHtml(name)}</h3>
                    <p style="margin:18px 0 0;font-size:30px;font-weight:700;letter-spacing:-.04em">${escapeHtml(price)}</p>
                    <p style="margin:12px 0 0;color:#53635b;line-height:1.55">${escapeHtml(limits)}</p>
                  </article>`,
              )
              .join('')}
          </div>
          <p style="margin:22px 0 0"><a href="/pricing/" style="color:#11543f;font-weight:700">Все лимиты и возможности тарифов</a></p>
        </section>

        <section aria-labelledby="fallback-links-title" style="padding:56px 0 0">
          <h2 id="fallback-links-title" style="margin:0;font-size:clamp(26px,3.4vw,38px);letter-spacing:-.04em">Разделы сайта</h2>
          <ul style="display:flex;flex-wrap:wrap;gap:10px;margin:22px 0 0;padding:0;list-style:none">
            ${routes
              .filter((route) => route.kind !== 'legal')
              .map(
                (route) =>
                  `<li><a href="/${route.path}/" style="display:inline-block;border:1px solid #dfe7e2;border-radius:12px;background:white;padding:10px 16px;color:#11543f;font-weight:600;text-decoration:none">${escapeHtml(route.eyebrow)}</a></li>`,
              )
              .join('')}
          </ul>
        </section>

        <section id="faq" aria-labelledby="fallback-faq-title" style="padding:64px 0">
          <h2 id="fallback-faq-title" style="margin:0;font-size:clamp(34px,5vw,58px);letter-spacing:-.045em">Вопросы о Sellico</h2>
          <div style="display:grid;gap:12px;margin-top:28px">
            ${landingFaq
              .map(
                ([question, answer]) => `
                  <article style="border:1px solid #dfe7e2;border-radius:18px;background:white;padding:22px">
                    <h3 style="margin:0;font-size:20px">${escapeHtml(question)}</h3>
                    <p style="margin:12px 0 0;color:#53635b;line-height:1.65">${escapeHtml(answer)}</p>
                  </article>`,
              )
              .join('')}
          </div>
        </section>
        ${staticFooter()}
      </div>
    </main>`;
}

function buildRouteFallback(route) {
  return `
    <main id="main-content" style="${pageStyles}">
      <div style="${containerStyles}">
        ${staticHeader()}
        <section style="border-radius:28px;background:#0d4d35;padding:clamp(32px,6vw,68px);color:white">
          <nav aria-label="Хлебные крошки" style="font-size:13px;color:rgba(255,255,255,.75)"><a href="/" style="color:white">Главная</a> / ${route.parent ? `<a href="${route.parent[1]}" style="color:white">${escapeHtml(route.parent[0])}</a> / ` : ''}${escapeHtml(route.eyebrow)}</nav>
          <p style="margin:34px 0 0;color:#b8efd8;font-size:12px;font-weight:700;letter-spacing:.16em;text-transform:uppercase">${escapeHtml(route.eyebrow)}</p>
          <h1 style="max-width:920px;margin:18px 0 0;font-size:clamp(38px,6vw,70px);line-height:1;letter-spacing:-.052em">${escapeHtml(route.h1)}</h1>
          <p style="max-width:790px;margin:24px 0 0;color:rgba(255,255,255,.8);font-size:18px;line-height:1.7">${escapeHtml(route.lead)}</p>
        </section>
        ${
          route.answer
            ? `<section data-direct-answer aria-labelledby="fallback-direct-answer-title" style="padding:38px 0;border-bottom:1px solid #dfe7e2"><p style="margin:0;color:#177357;font-size:12px;font-weight:700;letter-spacing:.16em;text-transform:uppercase">Короткий ответ</p><h2 id="fallback-direct-answer-title" style="max-width:900px;margin:14px 0 0;font-size:clamp(28px,4vw,42px);letter-spacing:-.04em">${escapeHtml(route.answer.title)}</h2><p style="max-width:900px;margin:18px 0 0;color:#53635b;font-size:17px;line-height:1.75">${escapeHtml(route.answer.text)}</p><ul style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));margin:24px 0 0;padding:0;border-top:1px solid #dfe7e2;list-style:none">${route.answer.points.map((point) => `<li style="padding:16px 18px 16px 0;border-bottom:1px solid #dfe7e2;color:#30453b;line-height:1.55">${escapeHtml(point)}</li>`).join('')}</ul></section>`
            : ''
        }
        ${
          route.definition
            ? `<section aria-label="Определение" style="padding-top:38px"><p style="max-width:900px;margin:0;font-size:clamp(20px,2.6vw,28px);line-height:1.45;color:#101a15">${escapeHtml(route.definition)}</p>${
                route.formula
                  ? `<div style="margin-top:26px;border-radius:22px;background:#0b1512;color:white;overflow:hidden"><p style="margin:0;padding:14px 24px;border-bottom:1px solid rgba(255,255,255,.1);font-size:12px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:#7ee3b8">Формула</p>${route.formula.rows
                      .map(
                        (row) =>
                          `<div style="padding:16px 24px;border-bottom:1px solid rgba(255,255,255,.07)"><span style="display:inline-block;min-width:230px;font-size:14px;font-weight:600;color:rgba(255,255,255,.6)">${escapeHtml(row.label)}</span><span style="font-family:ui-monospace,SFMono-Regular,monospace;font-size:16px">${escapeHtml(row.expression)}</span></div>`,
                      )
                      .join('')}<p style="margin:0;padding:14px 24px;font-size:14px;color:rgba(255,255,255,.55)">${escapeHtml(route.formula.note)}</p></div>`
                  : ''
              }</section>`
            : ''
        }
        <section aria-label="${escapeHtml(route.eyebrow)}" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:14px;padding-top:42px">
          ${route.sections
            .map(
              (section) => `
                <article style="border:1px solid #dfe7e2;border-radius:20px;background:white;padding:24px">
                  <h2 style="margin:0;font-size:23px;letter-spacing:-.025em">${escapeHtml(section.title)}</h2>
                  <p style="margin:14px 0 0;color:#53635b;line-height:1.7">${escapeHtml(section.text)}</p>
                  ${
                    section.items
                      ? `<ul style="margin:18px 0 0;padding-left:20px;color:#30453b;line-height:1.75">${section.items.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`
                      : ''
                  }
                  ${
                    section.href
                      ? `<p style="margin:18px 0 0"><a href="${section.href}" style="color:#11543f;font-weight:700">Подробнее — ${escapeHtml(section.title)}</a></p>`
                      : ''
                  }
                </article>`,
            )
            .join('')}
        </section>
        ${
          route.table
            ? `<section aria-label="${escapeHtml(route.table.title)}" style="padding-top:42px"><h2 style="margin:0;font-size:clamp(30px,4vw,44px);letter-spacing:-.04em">${escapeHtml(route.table.title)}</h2><p style="max-width:760px;margin:14px 0 0;color:#53635b;line-height:1.7">${escapeHtml(route.table.lead)}</p><div style="overflow-x:auto;margin-top:24px"><table style="width:100%;border-collapse:collapse;background:white;border:1px solid #dfe7e2;border-radius:16px"><thead><tr>${route.table.columns
                .map((c) => `<th style="padding:14px 16px;text-align:left;font-size:14px;border-bottom:1px solid #dfe7e2">${escapeHtml(c)}</th>`)
                .join('')}</tr></thead><tbody>${route.table.rows
                .map(
                  (row) =>
                    `<tr>${row.map((cell, i) => `<td style="padding:14px 16px;font-size:14px;line-height:1.6;color:${i === 0 ? '#101a15' : '#53635b'};border-bottom:1px solid #eef2f0">${escapeHtml(cell)}</td>`).join('')}</tr>`,
                )
                .join('')}</tbody></table></div></section>`
            : ''
        }
        ${
          route.extra
            ? `<section aria-label="${escapeHtml(route.extra.title)}" style="padding-top:42px"><h2 style="margin:0;font-size:clamp(30px,4vw,44px);letter-spacing:-.04em">${escapeHtml(route.extra.title)}</h2><p style="max-width:760px;margin:14px 0 0;color:#53635b;line-height:1.7">${escapeHtml(route.extra.lead)}</p><div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:14px;margin-top:26px">${route.extra.sections
                .map(
                  (section) =>
                    `<article style="border:1px solid #dfe7e2;border-radius:20px;background:white;padding:24px"><h3 style="margin:0;font-size:21px;letter-spacing:-.02em">${escapeHtml(section.title)}</h3><p style="margin:14px 0 0;color:#53635b;line-height:1.7">${escapeHtml(section.text)}</p><ul style="margin:16px 0 0;padding-left:20px;color:#30453b;line-height:1.75">${section.items.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul></article>`,
                )
                .join('')}</div></section>`
            : ''
        }
        ${
          route.faq
            ? `<section aria-label="Частые вопросы" style="padding-top:42px"><h2 style="margin:0;font-size:clamp(30px,4vw,44px);letter-spacing:-.04em">Частые вопросы</h2><div style="display:grid;gap:12px;margin-top:24px">${route.faq
                .map(
                  ([question, answer]) =>
                    `<article style="border:1px solid #dfe7e2;border-radius:18px;background:white;padding:22px"><h3 style="margin:0;font-size:20px">${escapeHtml(question)}</h3><p style="margin:12px 0 0;color:#53635b;line-height:1.65">${escapeHtml(answer)}</p></article>`,
                )
                .join('')}</div></section>`
            : ''
        }
        ${
          route.related
            ? `<section aria-label="Смежные страницы" style="padding-top:42px"><h2 style="margin:0;font-size:24px">Смотрите также</h2><ul style="margin:16px 0 0;padding-left:20px;line-height:1.9">${route.related
                .map(([label, href]) => `<li><a href="${href}" style="color:#11543f;font-weight:600">${escapeHtml(label)}</a></li>`)
                .join('')}</ul></section>`
            : ''
        }
        ${
          route.editorial
            ? `<section aria-labelledby="editorial-info-title" style="margin-top:42px;border:1px solid #dfe7e2;border-radius:22px;background:white;padding:26px"><p style="margin:0;color:#177357;font-size:12px;font-weight:700;letter-spacing:.14em;text-transform:uppercase">Редакционная информация</p><h2 id="editorial-info-title" style="margin:10px 0 0;font-size:25px">Проверено по первичным источникам</h2><p style="margin:14px 0 0;color:#53635b;line-height:1.7">Автор: <a href="${route.editorial.author.url}" style="color:#11543f;font-weight:700">${escapeHtml(route.editorial.author.name)}</a> · Обновлено: <time datetime="${route.lastmod}">${route.lastmod}</time> · <a href="${route.editorial.methodologyUrl}" style="color:#11543f;font-weight:700">Методология</a></p><h3 style="margin:22px 0 0;font-size:17px">Источники</h3><ul style="margin:10px 0 0;padding-left:20px;line-height:1.8">${route.editorial.sources
                .map(
                  (source) =>
                    `<li><a href="${source.url}" style="color:#11543f;font-weight:600">${escapeHtml(source.name)}</a> — ${escapeHtml(source.publisher)}</li>`,
                )
                .join('')}</ul></section>`
            : ''
        }
        ${
          route.kind === 'legal'
            ? ''
            : `<section style="margin-top:42px;border-radius:24px;background:#0b6b4d;padding:32px;color:white"><h2 style="margin:0;font-size:30px">Проверьте Sellico на данных своего магазина</h2><p style="max-width:700px;margin:14px 0 0;color:rgba(255,255,255,.8);line-height:1.7">3 дня бесплатно, подключение первого магазина примерно за 15 минут, без привязки банковской карты.</p><p style="margin:22px 0 0"><a href="https://sellico.ru/register" style="display:inline-block;border-radius:12px;background:#c8f44d;padding:14px 20px;color:#123525;font-weight:700;text-decoration:none">Начать бесплатно</a></p></section>`
        }
        ${staticFooter()}
      </div>
    </main>`;
}

function breadcrumbSchema(route) {
  const trail = [['Главная', 'https://sellico.ru/']];
  if (route.parent) trail.push([route.parent[0], `https://sellico.ru${route.parent[1]}`]);
  trail.push([route.eyebrow, route.canonical]);

  return {
    '@type': 'BreadcrumbList',
    '@id': `${route.canonical}#breadcrumb`,
    itemListElement: trail.map(([name, item], index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name,
      item,
    })),
  };
}

function faqSchema(items, id) {
  return {
    '@type': 'FAQPage',
    '@id': id,
    mainEntity: items.map(([question, answer]) => ({
      '@type': 'Question',
      name: question,
      acceptedAnswer: { '@type': 'Answer', text: answer },
    })),
  };
}

// Google для ProfilePage требует dateModified со временем: голая дата вида 2026-08-25
// отклоняется как «недопустимое значение даты/времени». Для остальных типов страниц
// полное значение тоже валидно, поэтому приводим единообразно.
const MOSCOW_OFFSET = '+03:00';
const toDateTime = (date) => (date ? `${date}T00:00:00${MOSCOW_OFFSET}` : undefined);

function routeSchema(route) {
  const pageNode = {
    '@type':
      route.kind === 'about'
        ? 'AboutPage'
        : route.kind === 'author'
          ? 'ProfilePage'
          : route.kind === 'cases'
            ? 'CollectionPage'
            : 'WebPage',
    '@id': `${route.canonical}#webpage`,
    url: route.canonical,
    name: route.title,
    description: route.description,
    ...(route.answer ? { abstract: route.answer.text } : {}),
    inLanguage: 'ru-RU',
    dateModified: toDateTime(route.lastmod),
    // lastReviewed по схеме — тип Date, время здесь не нужно.
    lastReviewed: route.lastmod,
    publisher: {
      '@id': 'https://sellico.ru/#organization',
    },
    isPartOf: {
      '@id': 'https://sellico.ru/#website',
    },
    breadcrumb: {
      '@id': `${route.canonical}#breadcrumb`,
    },
  };

  if (route.kind === 'author') {
    pageNode.dateCreated = toDateTime(route.created ?? route.lastmod);
  }

  if (route.editorial) {
    pageNode.author = {
      '@id': route.editorial.author.id,
    };
    pageNode.citation = route.editorial.sources.map((source) => ({
      '@type': 'CreativeWork',
      name: source.name,
      url: source.url,
      publisher: { '@type': 'Organization', name: source.publisher },
    }));
    pageNode.publishingPrinciples = route.editorial.methodologyUrl;
  }

  const graph = [organization, editorialPerson, website, pageNode, breadcrumbSchema(route)];

  if (route.kind === 'about') {
    pageNode.mainEntity = { '@id': 'https://sellico.ru/#organization' };
  }

  if (route.kind === 'author') {
    pageNode.mainEntity = { '@id': editorialPerson['@id'] };
  }

  if (route.kind === 'cases') {
    const scenarios = {
      '@type': 'ItemList',
      '@id': `${route.canonical}#scenarios`,
      name: 'Модельные сценарии использования Sellico',
      description:
        'Учебные сценарии без приписывания модельных показателей реальным клиентам и без гарантии результата.',
      numberOfItems: 3,
      itemListElement: [
        'Бренд одежды: контроль дефицита размеров',
        'Товары для дома: расчёт полной экономики SKU',
        'Marketplace-агентство: единая отчётность и задачи',
      ].map((name, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name,
      })),
    };
    pageNode.mainEntity = { '@id': scenarios['@id'] };
    graph.push(scenarios);
  }

  if (route.kind === 'glossary' && route.definition) {
    const term = {
      '@type': 'DefinedTerm',
      '@id': `${route.canonical}#term`,
      name: route.h1,
      description: route.definition,
      url: route.canonical,
      inDefinedTermSet: {
        '@type': 'DefinedTermSet',
        '@id': 'https://sellico.ru/glossary/#terms',
        name: 'Глоссарий продавца маркетплейса',
        url: 'https://sellico.ru/glossary/',
      },
    };
    pageNode.mainEntity = { '@id': term['@id'] };
    graph.push(term);
  }

  if (route.faq) {
    const faqId = `${route.canonical}#faq`;
    pageNode.hasPart = [...(pageNode.hasPart ?? []), { '@id': faqId }];
    graph.push(faqSchema(route.faq, faqId));
  }

  if (route.kind === 'pricing') {
    pageNode.mainEntity = { '@id': 'https://sellico.ru/#software' };
    graph.push({
      '@type': 'SoftwareApplication',
      '@id': 'https://sellico.ru/#software',
      name: 'Sellico',
      url: 'https://sellico.ru/',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web',
      inLanguage: 'ru-RU',
      publisher: {
        '@id': 'https://sellico.ru/#organization',
      },
      offers: {
        '@type': 'AggregateOffer',
        priceCurrency: 'RUB',
        lowPrice: '3000',
        highPrice: '40000',
        offerCount: '4',
        url: route.canonical,
        offers: [
          ['Старт', '3000'],
          ['Про', '8000'],
          ['Бизнес', '15000'],
          ['Enterprise', '40000'],
        ].map(([name, price]) => ({
          '@type': 'Offer',
          name,
          price,
          priceCurrency: 'RUB',
          url: route.canonical,
          priceSpecification: {
            '@type': 'UnitPriceSpecification',
            price,
            priceCurrency: 'RUB',
            unitText: 'MONTH',
            billingDuration: 'P1M',
          },
        })),
      },
    });
  }

  if (route.kind === 'marketplaces') {
    graph.push({
      '@type': 'ItemList',
      '@id': `${route.canonical}#marketplaces`,
      name: 'Маркетплейсы, поддерживаемые Sellico',
      numberOfItems: 3,
      itemListElement: ['Wildberries', 'Ozon', 'Яндекс Маркет'].map((name, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name,
      })),
    });
  }

  // Блок с шагами подключения размечаем как HowTo. Важно понимать: расширенный сниппет
  // по HowTo Google больше не показывает, разметка нужна для понимания страницы, не для звёздочек.
  const howTo = route.sections?.find((section) => section.title.startsWith('Как подключить'));
  if (howTo) {
    const howToId = `${route.canonical}#howto`;
    pageNode.hasPart = [...(pageNode.hasPart ?? []), { '@id': howToId }];
    graph.push({
      '@type': 'HowTo',
      '@id': howToId,
      name: howTo.title,
      description: howTo.text,
      totalTime: 'PT15M',
      step: howTo.items.map((item, index) => ({
        '@type': 'HowToStep',
        position: index + 1,
        name: item,
      })),
    });
  }

  if (route.kind === 'calculator') {
    pageNode.mainEntity = { '@id': `${route.canonical}#app` };
    graph.push({
      '@type': 'WebApplication',
      '@id': `${route.canonical}#app`,
      name: route.h1,
      url: route.canonical,
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web',
      browserRequirements: 'Требуется JavaScript',
      inLanguage: 'ru-RU',
      isAccessibleForFree: true,
      publisher: { '@id': 'https://sellico.ru/#organization' },
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'RUB' },
    });
  }

  if (route.kind === 'marketplace') {
    pageNode.mainEntity = { '@id': `${route.canonical}#software` };
    graph.push({
      '@type': 'SoftwareApplication',
      '@id': `${route.canonical}#software`,
      name: `Sellico для ${route.eyebrow}`,
      url: route.canonical,
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web',
      inLanguage: 'ru-RU',
      publisher: { '@id': 'https://sellico.ru/#organization' },
      offers: {
        '@type': 'AggregateOffer',
        priceCurrency: 'RUB',
        lowPrice: '3000',
        highPrice: '40000',
        offerCount: '4',
        url: 'https://sellico.ru/pricing/',
      },
    });
  }

  return {
    '@context': 'https://schema.org',
    '@graph': graph,
  };
}

// index.html снимает индексацию с путей вне списка — держим его в синхроне с routes.
function replacePublicPaths(html) {
  return html.replace(
    /const publicPages = new Set\(\[[^\]]*\]\);/,
    `const publicPages = new Set(${JSON.stringify(publicPaths)});`,
  );
}

// Дата главной живёт в одном месте — WebSite.dateModified в index.html; sitemap берёт её оттуда.
const homeLastmod = indexHtml.match(/"dateModified":\s*"(\d{4}-\d{2}-\d{2})T/)?.[1];
if (!homeLastmod) throw new Error('index.html: не найден WebSite.dateModified для lastmod главной');

function buildSitemap() {
  const urls = [
    { loc: 'https://sellico.ru/', lastmod: homeLastmod, changefreq: 'weekly', priority: '1.0' },
    ...routes.map((route) => ({
      loc: route.canonical,
      lastmod: route.lastmod,
      changefreq: route.changefreq,
      priority: route.priority,
    })),
  ];

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    ({ loc, lastmod, changefreq, priority }) =>
      `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`,
  )
  .join('\n')}
</urlset>
`;
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
  if (route.kind === 'pricing') {
    next = next.replace(
      '</head>',
      '  <link rel="alternate" type="text/markdown" href="https://sellico.ru/pricing.md" title="Тарифы Sellico" />\n  </head>',
    );
  }

  const schema = JSON.stringify(routeSchema(route)).replaceAll('<', '\\u003c');
  next = next.replace(
    /<script type="application\/ld\+json">[\s\S]*?<\/script>/,
    `<script type="application/ld+json">${schema}</script>`,
  );

  return injectRoot(next, buildRouteFallback(route));
}

const baseHtml = withFontPreload(replacePublicPaths(indexHtml));

// Ленивый чанк страницы начинает качаться только из lazy()-вызова, а до его загрузки на экране
// остаётся пререндер (первый рендер React идёт в startTransition, см. main.tsx).
// modulepreload в head запускает загрузку чанка параллельно с main.js и сокращает это ожидание.
async function findChunk(prefix) {
  const names = await readdir(join('dist', 'assets'));
  return names.find((name) => name.startsWith(prefix) && name.endsWith('.js'));
}

async function chunkPreload(prefix) {
  const chunk = await findChunk(prefix);
  return chunk ? `<link rel="modulepreload" crossorigin href="/assets/${chunk}" />\n  ` : '';
}

const [landingPreload, seoPreload, legalPreload] = await Promise.all([
  chunkPreload('XwayInspiredLanding'),
  chunkPreload('SeoContentPage'),
  chunkPreload('LegalPage'),
]);

function withChunkPreload(html, preload) {
  return preload ? html.replace('</head>', `${preload}</head>`) : html;
}

// LCP главной — промо-баннер из API. Запрос стартует вместе с main.js, а не после рендера React.
// crossorigin обязателен: без него preload не совпадёт с fetch() в PromoBanner и скачается дважды.
const promoApiPreload = '<link rel="preload" as="fetch" crossorigin href="/api/public/promo-banners" />\n  ';

// Контент детальной страницы — отдельный JSON-чанк, который SeoContentPage запрашивает только
// после собственной загрузки. modulepreload по манифесту Vite убирает этот последовательный шаг.
const manifestPath = join('dist', '.vite', 'manifest.json');
const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));

function contentPreload(route) {
  const slugs = route.kind === 'marketplaces' ? ['wildberries', 'ozon', 'yandex-market'] : [route.path];
  return slugs
    .map((slug) => manifest[`src/content/pages/${slug}.json`]?.file)
    .filter(Boolean)
    .map((file) => `<link rel="modulepreload" crossorigin href="/${file}" />\n  `)
    .join('');
}

// LCP страниц маркетплейсов — hero-картинка, которая появляется только после рендера React.
// srcset и sizes должны совпадать с <source type="image/avif"> в MarketplaceArtwork (SeoContentPage.tsx).
function heroPreload(route) {
  const base = `/assets/marketplaces/generated/${route.path}-system`;
  if (!existsSync(join('dist', `${base}-960.avif`))) return '';
  const srcset = [640, 960, 1536].map((width) => `${base}-${width}.avif ${width}w`).join(', ');
  return `<link rel="preload" as="image" type="image/avif" fetchpriority="high" imagesrcset="${srcset}" imagesizes="(max-width: 640px) 100vw, (max-width: 1100px) 82vw, 920px" />\n  `;
}

await writeFile(
  indexPath,
  injectRoot(withChunkPreload(baseHtml, landingPreload + promoApiPreload), buildLandingFallback()),
);

for (const route of routes) {
  const outputPath = join('dist', route.path, 'index.html');
  await mkdir(dirname(outputPath), { recursive: true });
  const chunk = route.kind === 'legal' ? legalPreload : seoPreload;
  const pageHtml = withChunkPreload(baseHtml, chunk + contentPreload(route) + heroPreload(route));
  await writeFile(outputPath, replaceMeta(pageHtml, route));
}

await writeFile(join('dist', 'sitemap.xml'), buildSitemap());
// Манифест больше не нужен и не должен уехать на прод.
await rm(join('dist', '.vite'), { recursive: true, force: true });

console.log(`prerendered landing fallback, ${routes.length} route(s) and sitemap.xml`);
