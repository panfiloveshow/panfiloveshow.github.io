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
import { editorialAuthor } from './editorial-data.mjs';
import { comparisonItemList, homeDirectAnswer, speakableSpecification, subscriptionService } from './structured-data.mjs';

const indexPath = join('dist', 'index.html');
const indexHtml = await readFile(indexPath, 'utf8');

// Страница без маршрута в App.tsx отдалась бы статикой, но ломалась при клиентской навигации.
const appSource = await readFile(join('src', 'App.tsx'), 'utf8');
const pagesIndexKeys = new Set(Object.keys(JSON.parse(await readFile(join('src', 'content', 'pages-index.json'), 'utf8'))));
const usesPagesIndex = appSource.includes('pages-index.json');
const missingRoutes = routes.filter(
  (route) => !appSource.includes(`'/${route.path}'`) && !(usesPagesIndex && pagesIndexKeys.has(route.path)),
);
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

function staticSkipLink() {
  return '<a href="#main-content" class="skip-link" style="position:absolute;left:-9999px;top:auto;width:1px;height:1px;overflow:hidden">Перейти к основному содержанию</a>';
}

function staticHeader() {
  return `
    <header style="margin-bottom:18px;display:flex;align-items:center;justify-content:space-between;gap:20px">
      <a href="/" style="display:flex;align-items:center;gap:10px;color:#101a15;font-weight:800;text-decoration:none">
        <img src="/logo.svg" alt="" aria-hidden="true" width="30" height="30"><span>sellico</span>
      </a>
      <nav aria-label="Основная навигация" style="display:flex;flex-wrap:wrap;justify-content:flex-end;gap:14px;font-size:14px">
        <a href="/features/" style="color:#11543f">Возможности</a>
        <a href="/marketplaces/" style="color:#11543f">Маркетплейсы</a>
        <a href="/compare/" style="color:#11543f">Сравнения</a>
        <a href="/pricing/" style="color:#11543f">Тарифы</a>
        <a href="/articles/" style="color:#11543f">Статьи</a>
        <a href="https://sellico.ru/login" style="color:#11543f">Войти</a>
        <a href="https://sellico.ru/register" style="color:#11543f;font-weight:700">Попробовать</a>
      </nav>
    </header>`;
}

function staticFooter() {
  // В статике подвал раньше содержал две юридические ссылки — до гидрации краулер видел
  // страницу почти без связей. Разделы берём из общей таблицы маршрутов.
  const groups = [
    ['Продукт', ['features', 'analytics-marketplaces', 'unit-economics', 'supply-planning', 'seo-cards', 'advertising', 'reviews', 'team', 'pricing']],
    ['Площадки', ['marketplaces', 'wildberries', 'ozon', 'yandex-market']],
    ['Сравнения', routes.filter((route) => route.kind === 'compare-hub' || route.kind === 'comparison').map((route) => route.path)],
    ['Инструменты', ['calculators', 'calculators/unit-economics', 'calculators/margin', 'calculators/cost-price', 'calculators/roi', 'calculators/abc-xyz', 'calculators/wildberries-logistics', 'calculators/turnover', 'calculators/drr', 'calculators/break-even']],
    ['Справочник', ['glossary', 'glossary/drr', 'glossary/turnover', 'glossary/margin', 'glossary/abc-analysis', 'glossary/fbo-fbs', 'glossary/buyout-rate', 'glossary/roi', 'glossary/conversion', 'glossary/cost-price', 'glossary/xyz-analysis', 'glossary/safety-stock', 'glossary/break-even', 'glossary/cpm-cpc-cpo', 'glossary/lost-sales']],
    // Статьи добавляются чаще остальных разделов — список собирается сам, чтобы новая не выпала из подвала.
    ['Статьи', routes.filter((route) => route.kind === 'articles-hub' || route.kind === 'article').map((route) => route.path)],
    ['Компания', ['about', 'authors/danil-zubarev', 'cases', 'methodology', 'contacts']],
  ];
  const byPath = new Map(routes.map((route) => [route.path, route]));

  return `
    <footer style="margin-top:64px;border-top:1px solid #dfe7e2;padding-top:26px;color:#53635b;font-size:13px;line-height:1.6">
      <nav aria-label="Разделы сайта" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:24px;margin-bottom:26px">
        ${groups
          .filter(([, paths]) => paths.some((path) => byPath.has(path)))
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
      <p>© 2026 Sellico · ИП ЗУБАРЕВ ДАНИЛ ВИКТОРОВИЧ · ИНН 644154992160 · <a href="mailto:hello@sellico.ru" style="color:#11543f">hello@sellico.ru</a> · <a href="https://t.me/sellico" style="color:#11543f">Telegram</a></p>
      <p><a href="/privacy/" style="color:#11543f">Политика обработки персональных данных</a> · <a href="/personal-data-consent/" style="color:#11543f">Согласие на обработку данных</a></p>
    </footer>`;
}

function buildLandingFallback() {
  const heroBenefits = [
    'Видите прибыль по каждому товару',
    'Контролируете остатки и поставки',
    'Работаете вместе с командой',
  ];
  const heroFacts = [
    ['3 маркетплейса', 'Wildberries, Ozon, Яндекс Маркет'],
    ['Прибыль по SKU', 'Выручка, расходы, себестоимость'],
    ['Одна команда', 'Задачи и процессы в одном кабинете'],
    ['3 дня бесплатно', 'Пробный период без карты'],
  ];
  const funnelSteps = [
    ['Аналитика', 'Понимаем прибыль и точки роста'],
    ['Остатки', 'Планируем закупки и поставки'],
    ['Реклама', 'Управляем ставками через экономику'],
    ['CRM', 'Превращаем сигналы в действия'],
    ['Прибыль', 'Масштабируем то, что работает'],
  ];
  const scenarios = [
    {
      eyebrow: 'Сценарий 1 · Бренд одежды (Wildberries)',
      title: 'Продажи растут, а нужные размеры заканчиваются',
      tasks: [
        'увидеть дефицит по размерам до потери продаж',
        'не рекламировать товары без достаточного запаса',
        'собирать план поставок без ручной сверки таблиц',
      ],
      actions: [
        'объединить остатки, продажи и рекламу в одном контуре',
        'проверять наличие критичных размеров',
        'учитывать наличие товара при планировании рекламы',
      ],
      timeline: 'Подключить магазин, загрузить историю и проверить остатки по размерам.',
    },
    {
      eyebrow: 'Сценарий 2 · Товары для дома (Wildberries, Ozon, Яндекс Маркет)',
      title: 'Оборот большой, но часть ассортимента продаётся в минус',
      tasks: [
        'посчитать реальную прибыль каждого SKU',
        'найти товары, которые съедают оборотный капитал',
        'сформировать понятный план цен и производства',
      ],
      actions: [
        'собрать себестоимость, комиссии и возвраты по SKU',
        'сравнить товары по прибыли и оборачиваемости',
        'подготовить изменения цен и производственного плана',
      ],
      timeline: 'Загрузить продажи и расходы, заполнить себестоимость и открыть юнит-экономику.',
    },
    {
      eyebrow: 'Сценарий 3 · Marketplace-агентство (Wildberries, Ozon)',
      title: 'Менеджеры тратят пятницу на сбор клиентских отчётов',
      tasks: [
        'собирать отчёты по всем кабинетам автоматически',
        'видеть просроченные задачи и ответственных',
        'давать клиенту понятный итог без десяти файлов',
      ],
      actions: [
        'собрать кабинеты и роли команды в одном пространстве',
        'согласовать единый формат еженедельного отчёта',
        'назначить задачи по рекламе и остаткам ответственным',
      ],
      timeline: 'Подключить кабинеты, пригласить команду и назначить роли.',
    },
  ];
  const plans = [
    {
      name: 'Старт',
      price: '3 000 ₽ в месяц',
      ctaHref: 'https://sellico.ru/register?plan=start',
      ctaLabel: 'Попробовать Старт',
      desc: 'Для одного магазина: 1 подключение, 3 человека, 50 товаров',
      features: [
        'Юнит-экономика',
        'Задачи и координация (CRM)',
        'Массовое редактирование описаний',
        'Отзывы — 100 в день на площадку',
        'SEO-генерация — 20 за период квоты',
        'SEO-аудит — 50 за период квоты',
        'Автопланирование — 1 поставка',
      ],
    },
    {
      name: 'Про',
      price: '8 000 ₽ в месяц',
      ctaHref: 'https://sellico.ru/register?plan=pro',
      ctaLabel: 'Попробовать Про',
      desc: 'Для растущей команды: 3 подключения, 10 человек, 150 товаров. Всё из Старт, плюс:',
      features: [
        'Финансовая отчётность',
        'Отзывы — 250 в день на площадку',
        'SEO-генерация — 100 за период квоты',
        'SEO-аудит — 150 за период квоты',
        'Автопланирование — 4 поставки',
      ],
    },
    {
      name: 'Бизнес',
      price: '15 000 ₽ в месяц',
      ctaHref: 'https://sellico.ru/register?plan=business',
      ctaLabel: 'Попробовать Бизнес',
      desc: 'Полный контур для бренда или агентства: 6 подключений, 20 человек, 300 товаров. Всё из Про, плюс:',
      features: [
        'Заявки и лиды',
        'Sellico Meet — видеосвязь',
        'Отзывы в день: Ozon — 250; WB, Яндекс и Uzum — по 100 000',
        'SEO-генерация — 200 за период квоты',
        'SEO-аудит — 300 за период квоты',
        'Автопланирование — 8 поставок',
      ],
    },
    {
      name: 'Enterprise',
      price: 'от 40 000 ₽ в месяц',
      ctaHref: 'mailto:hello@sellico.ru',
      ctaLabel: 'Обсудить Enterprise',
      desc: 'Для крупного бизнеса: подключения, люди и товары по договору. Всё из Бизнес, плюс:',
      features: [
        'Роадмап',
        'Договорные лимиты — товары, интеграции, пользователи',
        'Договорные SEO и автопланирование',
        'Индивидуальные условия внедрения',
      ],
    },
  ];

  return `
    ${staticSkipLink()}
    <main id="main-content" style="${pageStyles}">
      <div style="${containerStyles}">
        ${staticHeader()}
        <style>.fallback-hero{display:grid;grid-template-columns:minmax(0,.93fr) minmax(0,1.07fr);align-items:center;gap:4.1%;padding:48px 0;color:#19282e}.fallback-hero img{display:block;width:100%;max-width:100%;height:auto;border-radius:20px}.fallback-hero h1{margin:0;font-size:clamp(32px,4.6vw,74px);font-weight:700;line-height:1.08;letter-spacing:-.052em}@media(max-width:1023px){.fallback-hero{grid-template-columns:1fr;gap:32px;padding:32px 0}.fallback-hero img{grid-row:2}.fallback-hero h1{font-size:clamp(32px,6.5vw,56px)}}</style>
        <section class="fallback-hero">
          <img src="/assets/hero/2026-10-19/01-profit.webp" srcset="/assets/hero/2026-10-19/01-profit-640.webp 640w, /assets/hero/2026-10-19/01-profit-960.webp 960w, /assets/hero/2026-10-19/01-profit.webp 1254w" sizes="(max-width: 1023px) calc(100vw - 48px), 46vw" width="1254" height="1254" alt="Прибыль по SKU. Все расходы рядом: комиссии, реклама и себестоимость." fetchpriority="high" style="display:block;width:100%;max-width:100%;height:auto;border-radius:20px">
          <div>
            <h1>Система управления бизнесом на маркетплейсах</h1>
            <p style="margin:24px 0 0;color:#56655e;font-size:16px;line-height:1.7">Продавайте на Wildberries, Ozon и Яндекс Маркете. Sellico соберёт прибыль, остатки, рекламу и задачи команды в одну понятную картину.</p>
            <p style="margin:24px 0 0"><a href="https://sellico.ru/register" style="display:inline-block;border-radius:10px;background:#087f5e;padding:16px 22px;color:white;font-size:19px;font-weight:600;text-decoration:none">Попробовать бесплатно</a></p>
            <p style="margin:16px 0 0;color:#56655e;font-size:13px;line-height:1.6">3 дня бесплатно · Без карты · С создания пространства, включая загрузку истории.</p>
            <ul style="margin:20px 0 0;padding-left:20px;color:#30453b;line-height:1.7">${heroBenefits.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>
          </div>
        </section>

        <ul style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px;margin:0 0 28px;padding:0;list-style:none">
          ${heroFacts.map(([title, desc]) => `<li style="border-radius:16px;background:#eaf6f1;padding:18px"><strong style="display:block;font-size:18px;color:#101a15">${escapeHtml(title)}</strong><span style="display:block;margin-top:6px;color:#53635b;font-size:14px">${escapeHtml(desc)}</span></li>`).join('')}
        </ul>

        <section data-direct-answer aria-labelledby="fallback-direct-answer-title" style="padding:36px 0;border-top:1px solid #dfe7e2;border-bottom:1px solid #dfe7e2">
          <p style="margin:0;color:#177357;font-size:12px;font-weight:700;letter-spacing:.16em;text-transform:uppercase">Коротко о продукте</p>
          <h2 id="fallback-direct-answer-title" style="max-width:900px;margin:12px 0 0;font-size:clamp(26px,3.6vw,38px);letter-spacing:-.035em">${escapeHtml(homeDirectAnswer.title)}</h2>
          <p style="max-width:920px;margin:16px 0 0;color:#53635b;font-size:17px;line-height:1.75">${escapeHtml(homeDirectAnswer.text)}</p>
          <ul style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:12px;margin:22px 0 0;padding:0;list-style:none">
            ${homeDirectAnswer.points.map((point) => `<li style="border:1px solid #dfe7e2;border-radius:16px;background:white;padding:16px;color:#30453b;line-height:1.55">${escapeHtml(point)}</li>`).join('')}
          </ul>
        </section>

        <section id="video" aria-labelledby="fallback-video-title" style="padding:52px 0 20px">
          <h2 id="fallback-video-title" style="margin:0;font-size:clamp(30px,4.2vw,48px);letter-spacing:-.045em">Sellico за 25 секунд</h2>
          <p style="max-width:780px;margin:14px 0 0;color:#53635b;font-size:17px;line-height:1.7">Канбан задач, юнит-экономика с разбором прибыли по товару и финансовая сводка. Данные в ролике демонстрационные. <a href="/assets/video/sellico-overview.mp4" style="color:#11543f;font-weight:600">Скачать видеообзор Sellico (MP4)</a></p>
        </section>

        <section id="wow" aria-labelledby="fallback-ai-title" style="padding:44px 0 20px">
          <h2 id="fallback-ai-title" style="margin:0;font-size:clamp(30px,4.2vw,48px);letter-spacing:-.045em">Искусственный интеллект в каждом решении</h2>
          <p style="max-width:780px;margin:14px 0 0;color:#53635b;font-size:17px;line-height:1.7">Sellico анализирует данные, находит точки роста и предлагает конкретные действия — от новой поставки до корректировки рекламы и SEO карточек. <a href="https://sellico.ru/register" style="color:#11543f;font-weight:600">Начать работу</a></p>
        </section>

        <section id="how" aria-labelledby="fallback-funnel-title" style="padding:44px 0 20px">
          <h2 id="fallback-funnel-title" style="margin:0;font-size:clamp(30px,4.2vw,48px);letter-spacing:-.045em">От данных до прибыли — один непрерывный процесс</h2>
          <p style="max-width:780px;margin:14px 0 0;color:#53635b;line-height:1.7">Каждый сигнал превращается в понятное действие, а каждое действие связано с экономикой бизнеса. <a href="https://sellico.ru/register" style="color:#11543f;font-weight:600">Подключить магазин</a></p>
          <ul style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px;margin:24px 0 0;padding:0;list-style:none">
            ${funnelSteps.map(([title, text]) => `<li style="border:1px solid #dfe7e2;border-radius:16px;background:white;padding:18px"><strong style="display:block;color:#101a15">${escapeHtml(title)}</strong><span style="display:block;margin-top:6px;color:#53635b;font-size:14px">${escapeHtml(text)}</span></li>`).join('')}
          </ul>
        </section>

        <section id="demo" aria-labelledby="fallback-demo-title" style="padding:44px 0 20px">
          <h2 id="fallback-demo-title" style="margin:0;font-size:clamp(30px,4.2vw,48px);letter-spacing:-.045em">Интерфейс команды — как в Sellico</h2>
          <p style="max-width:820px;margin:14px 0 0;color:#53635b;font-size:17px;line-height:1.7">Интерактивная копия рабочего пространства: задачи, организатор, заявки, отзывы, финансы, SEO, координация и чат собраны на одной странице. Изменены только демонстрационные данные. <a href="/features/" style="color:#11543f;font-weight:700">Все возможности Sellico</a> · <a href="https://sellico.ru/register" style="color:#11543f;font-weight:700">Открыть свой кабинет</a></p>
        </section>

        <section aria-labelledby="fallback-mp-title" style="padding:44px 0 20px">
          <h2 id="fallback-mp-title" style="margin:0;font-size:clamp(30px,4.2vw,48px);letter-spacing:-.045em">Растите на каждом маркетплейсе</h2>
          <p style="margin:14px 0 0;color:#53635b">Общая экономика и процессы — с учётом правил каждой площадки.</p>
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:14px;margin-top:22px">
            <article style="border:1px solid #dfe7e2;border-radius:20px;background:white;padding:24px">
              <h3 style="margin:0;font-size:22px">Wildberries — управляйте продажами увереннее</h3>
              <p style="margin:12px 0 0;color:#53635b;line-height:1.65">Остатки, маржа, карточки и реклама Wildberries — в одном контуре. <a href="/wildberries/" style="color:#11543f;font-weight:600">Sellico для Wildberries</a></p>
            </article>
            <article style="border:1px solid #dfe7e2;border-radius:20px;background:white;padding:24px">
              <h3 style="margin:0;font-size:22px">Ozon — продавайте больше без лишних расходов</h3>
              <p style="margin:12px 0 0;color:#53635b;line-height:1.65">Цены, остатки, поставки и эффективность рекламы Ozon в одном окне. <a href="/ozon/" style="color:#11543f;font-weight:600">Sellico для Ozon</a></p>
            </article>
            <article style="border:1px solid #dfe7e2;border-radius:20px;background:white;padding:24px">
              <h3 style="margin:0;font-size:22px">Яндекс Маркет — единый учёт FBY, FBS и DBS</h3>
              <p style="margin:12px 0 0;color:#53635b;line-height:1.65">Продажи, удержания, запасы и отзывы Яндекс Маркета в общей финансовой модели. <a href="/yandex-market/" style="color:#11543f;font-weight:600">Sellico для Яндекс Маркета</a></p>
            </article>
          </div>
        </section>

        <section id="proof" aria-labelledby="fallback-cases-title" style="padding:52px 0 20px">
          <h2 id="fallback-cases-title" style="margin:0;font-size:clamp(30px,4.2vw,48px);letter-spacing:-.045em">Конкретная задача. Понятное решение.</h2>
          <p style="margin:14px 0 0;color:#53635b">Три рабочих модельных сценария: от задачи продавца до действий команды и показателей для контроля.</p>
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:14px;margin-top:24px">
            ${scenarios
              .map(
                (item) => `
                  <article style="border:1px solid #dfe7e2;border-radius:20px;background:white;padding:24px">
                    <p style="margin:0;color:#177357;font-size:12px;font-weight:700;text-transform:uppercase">${escapeHtml(item.eyebrow)}</p>
                    <h3 style="margin:10px 0 0;font-size:21px">${escapeHtml(item.title)}</h3>
                    <p style="margin:14px 0 6px;font-weight:600;font-size:14px">Задача:</p>
                    <ul style="margin:0;padding-left:18px;color:#53635b;font-size:14px;line-height:1.6">${item.tasks.map((t) => `<li>${escapeHtml(t)}</li>`).join('')}</ul>
                    <p style="margin:14px 0 6px;font-weight:600;font-size:14px">Действия в Sellico:</p>
                    <ul style="margin:0;padding-left:18px;color:#53635b;font-size:14px;line-height:1.6">${item.actions.map((a) => `<li>${escapeHtml(a)}</li>`).join('')}</ul>
                    <p style="margin:14px 0 0;color:#30453b;font-size:14px">${escapeHtml(item.timeline)}</p>
                  </article>`,
              )
              .join('')}
          </div>
          <p style="margin:20px 0 0"><a href="/cases/" style="color:#11543f;font-weight:700">Подробнее о сценариях и проверке показателей</a></p>
        </section>

        <section id="pricing" aria-labelledby="fallback-pricing-title" style="padding:56px 0 24px">
          <h2 id="fallback-pricing-title" style="margin:0;font-size:clamp(34px,5vw,58px);letter-spacing:-.045em">Выберите масштаб. Возможности уже внутри.</h2>
          <p style="margin:14px 0 0;color:#53635b">Все цены указаны за месяц. Каждый следующий тариф включает всё из предыдущего. Пробный период: 3 дня с создания пространства, включая загрузку истории, без карты.</p>
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:14px;margin-top:28px">
            ${plans
              .map(
                (plan) => `
                  <article style="border:1px solid #dfe7e2;border-radius:20px;background:white;padding:24px">
                    <h3 style="margin:0;color:#177357;font-size:15px;text-transform:uppercase;letter-spacing:.12em">${escapeHtml(plan.name)}</h3>
                    <p style="margin:14px 0 0;font-size:28px;font-weight:700;letter-spacing:-.04em">${escapeHtml(plan.price)}</p>
                    <p style="margin:10px 0 0;color:#53635b;font-size:14px;line-height:1.55">${escapeHtml(plan.desc)}</p>
                    <ul style="margin:14px 0 0;padding-left:18px;color:#30453b;font-size:14px;line-height:1.6">${plan.features.map((f) => `<li>${escapeHtml(f)}</li>`).join('')}</ul>
                    <p style="margin:16px 0 0"><a href="${escapeHtml(plan.ctaHref)}" style="color:#11543f;font-weight:700">${escapeHtml(plan.ctaLabel)}</a></p>
                  </article>`,
              )
              .join('')}
          </div>
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:12px;margin-top:20px;color:#53635b;font-size:14px;line-height:1.6">
            <p><strong>Что считается подключением:</strong> один кабинет магазина на маркетплейсе, подключённый по API. Для нескольких кабинетов нужны отдельные подключения.</p>
            <p><strong>Как считается лимит товаров:</strong> лимит товарных позиций общий для рабочего пространства и его магазинов. Текущее использование видно в кабинете.</p>
            <p><strong>Что означает период SEO-квоты:</strong> количество доступных генераций и аудитов. Остаток и условия обновления проверьте в кабинете перед запуском; ежемесячное пополнение не заявлено.</p>
          </div>
          <p style="margin:22px 0 0"><a href="/pricing/" style="color:#11543f;font-weight:700">Все лимиты и возможности тарифов</a> · <a href="/compare/" style="color:#11543f;font-weight:700">Сравнить Sellico с Excel и парсерами ниш</a></p>
        </section>

        <section aria-labelledby="fallback-links-title" style="padding:48px 0 0">
          <h2 id="fallback-links-title" style="margin:0;font-size:clamp(26px,3.4vw,38px);letter-spacing:-.04em">Разделы сайта и инструменты</h2>
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

        <section id="faq" aria-labelledby="fallback-faq-title" style="padding:56px 0">
          <h2 id="fallback-faq-title" style="margin:0;font-size:clamp(34px,5vw,58px);letter-spacing:-.045em">Всё важное перед подключением</h2>
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
    ${staticSkipLink()}
    <main id="main-content" style="${pageStyles}">
      <div style="${containerStyles}">
        ${staticHeader()}
        <section style="border-radius:28px;background:#0d4d35;padding:clamp(32px,6vw,68px);color:white">
          <nav aria-label="Хлебные крошки" style="font-size:13px;color:rgba(255,255,255,.75)"><a href="/" style="color:white">Главная</a> / ${route.parent ? `<a href="${route.parent[1]}" style="color:white">${escapeHtml(route.parent[0])}</a> / ` : ''}${escapeHtml(route.eyebrow)}</nav>
          ${
            // Портрет — LCP профиля. srcset и sizes — как в AuthorProfilePage (AUTHOR_PORTRAIT_SIZES),
            // поэтому он качается сразу из HTML, а React берёт его из кэша.
            route.kind === 'author'
              ? `<img src="${editorialAuthor.photo}-portrait-960.webp" srcset="${editorialAuthor.photo}-portrait-480.webp 480w, ${editorialAuthor.photo}-portrait-960.webp 960w" sizes="(min-width: 1024px) 480px, min(384px, calc(100vw - 40px))" width="960" height="1200" alt="${escapeHtml(editorialAuthor.name)}" fetchpriority="high" style="display:block;margin:34px 0 0;width:100%;max-width:280px;height:auto;border-radius:28px">`
              : ''
          }
          <p style="margin:34px 0 0;color:#b8efd8;font-size:12px;font-weight:700;letter-spacing:.16em;text-transform:uppercase">${escapeHtml(route.eyebrow)}</p>
          <h1 style="max-width:920px;margin:18px 0 0;font-size:clamp(38px,6vw,70px);line-height:1;letter-spacing:-.052em">${escapeHtml(route.h1)}</h1>
          <p style="max-width:790px;margin:24px 0 0;color:rgba(255,255,255,.8);font-size:18px;line-height:1.7">${escapeHtml(route.lead)}</p>
          ${
            route.certificate
              ? `<p style="max-width:790px;margin:20px 0 0;color:rgba(255,255,255,.8);font-size:15px;line-height:1.7">${escapeHtml(route.certificate.note)} — свидетельство Роспатента № ${route.certificate.number} от ${route.certificate.date.split('-').reverse().join('.')}. <a href="${escapeHtml(route.certificate.url)}" rel="noreferrer" style="color:white;font-weight:700">Запись в реестре ФИПС</a></p>`
              : ''
          }
        </section>
        ${
          route.kind === 'marketplace' && ['wildberries', 'ozon', 'yandex-market'].includes(route.path)
            ? `<figure style="max-width:896px;margin:28px 0 0"><picture><source type="image/avif" srcset="/assets/marketplaces/generated/${route.path}-system-640.avif 640w, /assets/marketplaces/generated/${route.path}-system-960.avif 960w, /assets/marketplaces/generated/${route.path}-system-1536.avif 1536w" sizes="(max-width: 640px) 100vw, (max-width: 1100px) 82vw, 920px"><img src="/assets/marketplaces/generated/${route.path}-system-960.webp" srcset="/assets/marketplaces/generated/${route.path}-system-640.webp 640w, /assets/marketplaces/generated/${route.path}-system-960.webp 960w, /assets/marketplaces/generated/${route.path}-system-1536.webp 1536w" sizes="(max-width: 640px) 100vw, (max-width: 1100px) 82vw, 920px" width="960" height="720" alt="Схема модулей Sellico для ${escapeHtml(route.eyebrow)}" fetchpriority="high" style="display:block;width:100%;max-width:100%;height:auto;border-radius:26px"></picture><figcaption style="margin-top:10px;font-size:12px;color:#53635b">Рабочий контур управления магазином ${escapeHtml(route.eyebrow)}: товары, остатки, поставки и экономика</figcaption></figure>`
            : ''
        }
        ${
          // srcset и sizes — как у обложки в ArticlePage (SeoContentPage.tsx), чтобы React взял картинку из кэша.
          route.cover
            ? `<figure style="max-width:896px;margin:28px 0 0"><img src="${route.cover.src}-1600.webp" srcset="${route.cover.src}-800.webp 800w, ${route.cover.src}-1600.webp 1600w" sizes="(min-width: 1024px) 896px, calc(100vw - 40px)" width="1600" height="840" alt="${escapeHtml(route.cover.alt)}" fetchpriority="high" style="display:block;width:100%;height:auto;border-radius:26px"><figcaption style="margin-top:10px;font-size:12px;color:#53635b">Фото: <a href="${route.cover.creditUrl}" rel="noreferrer nofollow" style="color:#11543f">${escapeHtml(route.cover.credit)}</a>, Unsplash</figcaption></figure>`
            : ''
        }
        ${
          route.answer
            ? `<section data-direct-answer aria-labelledby="fallback-direct-answer-title" style="padding:38px 0;border-bottom:1px solid #dfe7e2"><p style="margin:0;color:#177357;font-size:12px;font-weight:700;letter-spacing:.16em;text-transform:uppercase">Короткий ответ</p><h2 id="fallback-direct-answer-title" style="max-width:900px;margin:14px 0 0;font-size:clamp(28px,4vw,42px);letter-spacing:-.04em">${escapeHtml(route.answer.title)}</h2><p style="max-width:900px;margin:18px 0 0;color:#53635b;font-size:17px;line-height:1.75">${escapeHtml(route.answer.text)}</p><ul style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));margin:24px 0 0;padding:0;border-top:1px solid #dfe7e2;list-style:none">${route.answer.points.map((point) => `<li style="padding:16px 18px 16px 0;border-bottom:1px solid #dfe7e2;color:#30453b;line-height:1.55">${escapeHtml(point)}</li>`).join('')}</ul></section>`
            : ''
        }
        ${
          route.definition
            ? `<section aria-label="Определение" style="padding-top:38px"><p data-term-definition style="max-width:900px;margin:0;font-size:clamp(20px,2.6vw,28px);line-height:1.45;color:#101a15">${escapeHtml(route.definition)}</p>${
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
        ${
          route.kind === 'article' || route.kind === 'comparison'
            ? `<nav aria-label="Содержание" style="padding-top:38px"><p style="margin:0;color:#177357;font-size:12px;font-weight:700;letter-spacing:.16em;text-transform:uppercase">Содержание</p><ol style="margin:14px 0 0;padding-left:20px;line-height:1.9">${route.sections
                .map((section, index) => `<li><a href="#section-${index + 1}" style="color:#11543f">${escapeHtml(section.title)}</a></li>`)
                .join('')}</ol></nav>`
            : ''
        }
        <section aria-label="${escapeHtml(route.eyebrow)}" style="display:grid;grid-template-columns:${route.kind === 'article' || route.kind === 'comparison' ? '1fr' : 'repeat(auto-fit,minmax(280px,1fr))'};gap:14px;padding-top:42px">
          ${route.sections
            .map(
              (section, index) => `
                <article id="section-${index + 1}" style="border:1px solid #dfe7e2;border-radius:20px;background:white;padding:24px">
                  <h2 style="margin:0;font-size:23px;letter-spacing:-.025em">${escapeHtml(section.title)}</h2>
                  ${section.text
                    .split('\n\n')
                    .map((paragraph) => `<p style="margin:14px 0 0;color:#53635b;line-height:1.7">${escapeHtml(paragraph)}</p>`)
                    .join('')}
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
            ? `<section aria-label="${escapeHtml(route.table.title)}" style="padding-top:42px"><h2 style="margin:0;font-size:clamp(30px,4vw,44px);letter-spacing:-.04em">${escapeHtml(route.table.title)}</h2><p style="max-width:760px;margin:14px 0 0;color:#53635b;line-height:1.7">${escapeHtml(route.table.lead)}</p><div style="overflow-x:auto;margin-top:24px"><table aria-label="${escapeHtml(route.table.title)}" style="width:100%;border-collapse:collapse;background:white;border:1px solid #dfe7e2;border-radius:16px"><caption style="position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0">${escapeHtml(route.table.title)}</caption><thead><tr>${route.table.columns
                .map((c) => `<th scope="col" style="padding:14px 16px;text-align:left;font-size:14px;border-bottom:1px solid #dfe7e2">${escapeHtml(c)}</th>`)
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
            ? `<section aria-labelledby="editorial-info-title" class="author-bio" style="margin-top:42px;border:1px solid #dfe7e2;border-radius:22px;background:white;padding:26px"><p style="margin:0;color:#177357;font-size:12px;font-weight:700;letter-spacing:.14em;text-transform:uppercase">Редакционная информация</p><h2 id="editorial-info-title" style="margin:10px 0 0;font-size:25px">Проверено по первичным источникам</h2><p style="margin:14px 0 0;color:#53635b;line-height:1.7">Автор: <a href="${route.editorial.author.url}" rel="author" style="color:#11543f;font-weight:700">${escapeHtml(route.editorial.author.name)}</a> · ${route.kind === 'article' ? `Опубликовано: <time datetime="${route.created}">${route.created}</time> · ` : ''}Обновлено: <time datetime="${route.lastmod}">${route.lastmod}</time> · <a href="${route.editorial.methodologyUrl}" style="color:#11543f;font-weight:700">Методология</a></p><h3 style="margin:22px 0 0;font-size:17px">Источники</h3><ul style="margin:10px 0 0;padding-left:20px;line-height:1.8">${route.editorial.sources
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
            : `<section style="margin-top:42px;border-radius:24px;background:#0b6b4d;padding:32px;color:white"><h2 style="margin:0;font-size:30px">Проверьте Sellico на данных своего магазина</h2><p style="max-width:700px;margin:14px 0 0;color:rgba(255,255,255,.8);line-height:1.7">Подключите API магазина и дождитесь загрузки истории. Пробный период — 3 дня с создания пространства, включая загрузку данных, без карты.</p><p style="margin:22px 0 0"><a href="https://sellico.ru/register" style="display:inline-block;border-radius:12px;background:#c8f44d;padding:14px 20px;color:#123525;font-weight:700;text-decoration:none">Начать бесплатно</a></p></section>`
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
  const speakable = speakableSpecification(route);
  const pageNode = {
    '@type':
      route.kind === 'about'
        ? 'AboutPage'
        : route.kind === 'author'
          ? 'ProfilePage'
          : route.kind === 'cases' || route.kind === 'compare-hub'
            ? 'CollectionPage'
            : 'WebPage',
    '@id': `${route.canonical}#webpage`,
    url: route.canonical,
    name: route.h1,
    description: route.description,
    ...(route.answer ? { abstract: route.answer.text } : {}),
    ...(speakable ? { speakable } : {}),
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

  const PUBLISHER_ORIGINS = {
    Wildberries: 'https://wildberries.ru',
    Ozon: 'https://ozon.ru',
    'Яндекс Маркет': 'https://market.yandex.ru',
    'ФНС России': 'https://www.nalog.gov.ru',
    'Google Search Central': 'https://developers.google.com',
    OpenAI: 'https://openai.com',
    Perplexity: 'https://www.perplexity.ai',
    Anthropic: 'https://www.anthropic.com',
  };

  if (route.editorial) {
    pageNode.author = {
      '@id': route.editorial.author.id,
    };
    pageNode.citation = route.editorial.sources.map((source) => {
      const canonicalOrigin = PUBLISHER_ORIGINS[source.publisher] ?? new URL(source.url).origin;
      const publisher =
        source.publisher === 'Sellico'
          ? { '@id': 'https://sellico.ru/#organization' }
          : { '@type': 'Organization', '@id': `${canonicalOrigin}/#organization`, name: source.publisher, url: `${canonicalOrigin}/` };
      return {
        '@type': 'CreativeWork',
        name: source.name,
        url: source.url,
        publisher,
      };
    });
    pageNode.publishingPrinciples = route.editorial.methodologyUrl;
  }

  // Полное description организации и автора держим на их профильных страницах, чтобы
  // не создавать schema-drift на страницах, где этот текст не выводится в видимом контенте.
  const orgNode = route.kind === 'about' ? organization : { ...organization, description: undefined };
  const personNode = route.kind === 'author' ? editorialPerson : { ...editorialPerson, description: undefined };
  const graph = [orgNode, personNode, website, pageNode, breadcrumbSchema(route)];

  if (route.kind === 'features') {
    pageNode.mainEntity = { '@id': 'https://sellico.ru/#software' };
    graph.push(subscriptionService({ description: route.description }));
  }

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
      name: 'Сценарии использования Sellico',
      description:
        'Задачи продавца, действия команды и показатели для контроля остатков, прибыли по товарам и отчётности.',
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

  if (route.kind === 'compare-hub') {
    const comparisons = comparisonItemList(route);
    pageNode.mainEntity = { '@id': comparisons['@id'] };
    graph.push(comparisons);
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

  // Статье нужны дата публикации и картинка: без них поисковики не показывают дату в сниппете
  // и не считают страницу материалом с автором.
  if (route.kind === 'article') {
    if (!route.cover) throw new Error(`${route.path}: у статьи нет обложки (cover)`);
    const article = {
      '@type': 'Article',
      '@id': `${route.canonical}#article`,
      headline: route.h1,
      description: route.description,
      image: `https://sellico.ru${route.cover.src}.jpg`,
      inLanguage: 'ru-RU',
      datePublished: toDateTime(route.created),
      dateModified: toDateTime(route.lastmod),
      author: { '@id': route.editorial.author.id },
      publisher: { '@id': 'https://sellico.ru/#organization' },
      mainEntityOfPage: { '@id': pageNode['@id'] },
      ...(speakable ? { speakable } : {}),
    };
    pageNode.mainEntity = { '@id': article['@id'] };
    graph.push(article);
  }

  if (route.faq) {
    const faqId = `${route.canonical}#faq`;
    pageNode.hasPart = [...(pageNode.hasPart ?? []), { '@id': faqId }];
    graph.push(faqSchema(route.faq, faqId));
  }

  if (route.kind === 'pricing') {
    pageNode.mainEntity = { '@id': 'https://sellico.ru/#software' };
    graph.push(subscriptionService({ description: route.description }));
  }

  if (route.kind === 'marketplaces') {
    const marketplacesId = `${route.canonical}#marketplaces`;
    pageNode.mainEntity = { '@id': marketplacesId };
    graph.push({
      '@type': 'ItemList',
      '@id': marketplacesId,
      name: route.h1,
      numberOfItems: 3,
      itemListElement: ['Wildberries', 'Ozon', 'Яндекс Маркет'].map((name, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name,
      })),
    });
  }

  if (route.kind === 'calculator') {
    // The calculator is a free interactive WebPage. Without user reviews it
    // does not claim eligibility for Google's software-app rich result.
    // A zero-price access offer preserves "free" without invoking Google's
    // paywall parser (which constrains the unrelated FAQ hasPart relation).
    pageNode.offers = { '@type': 'Offer', price: 0, priceCurrency: 'RUB', url: route.canonical };
  }

  if (route.kind === 'marketplace') {
    const mpImageUrl = `https://sellico.ru/assets/marketplaces/generated/${route.path}-system-960.webp`;
    const mpImageId = `${route.canonical}#primary-image`;
    pageNode.primaryImageOfPage = { '@id': mpImageId };
    graph.push({
      '@type': 'ImageObject',
      '@id': mpImageId,
      url: mpImageUrl,
      contentUrl: mpImageUrl,
      width: 960,
      height: 720,
      caption: `Рабочий контур управления магазином ${route.eyebrow} в системе Sellico`,
    });
    pageNode.mainEntity = { '@id': `${route.canonical}#software` };
    graph.push(subscriptionService({
      id: `${route.canonical}#software`,
      name: `Sellico для ${route.eyebrow}`,
      url: route.canonical,
      description: route.description,
      image: mpImageUrl,
    }));
  }

  return {
    '@context': 'https://schema.org',
    '@graph': graph,
  };
}

// Выносим guard во внешний /robots-guard.js — это убирает единственный инлайн-скрипт из HTML
// и позволяет включить строгий CSP script-src без 'unsafe-inline'.
function buildRobotsGuardScript() {
  return `(() => {
  const normalizedPath = window.location.pathname.length > 1
    ? window.location.pathname.replace(/\\/+$/, '')
    : window.location.pathname;
  const publicPages = new Set(${JSON.stringify(publicPaths)});
  if (!publicPages.has(normalizedPath)) {
    const robots = document.querySelector('meta[name="robots"]');
    if (robots) robots.setAttribute('content', 'noindex, nofollow');
  }
})();\n`;
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
  // У статьи в превью ссылки (Telegram, VK, мессенджеры) — своя обложка, а не общая картинка сайта.
  if (route.cover) {
    const image = `https://sellico.ru${route.cover.src}.jpg`;
    next = next
      .replace(/<meta\s+property="og:type"\s+content="[^"]*"\s*\/>/, '<meta property="og:type" content="article" />')
      .replace(/<meta\s+property="og:image"\s+content="[^"]*"\s*\/>/, `<meta property="og:image" content="${image}" />`)
      .replace(
        /<meta\s+property="og:image:alt"\s+content="[^"]*"\s*\/>/,
        `<meta property="og:image:alt" content="${escapeHtml(route.cover.alt)}" />`,
      )
      .replace(/<meta\s+name="twitter:image"\s+content="[^"]*"\s*\/>/, `<meta name="twitter:image" content="${image}" />`);
  }
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

const baseHtml = withFontPreload(indexHtml);

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

// Встроенный постер виден до ответа API и находится в статическом fallback.
// Ранний preload ускоряет его первый показ; загруженные баннеры запрашивает HeroBanner.
const heroBannerPreload = '<link rel="preload" as="image" type="image/webp" imagesrcset="/assets/hero/2026-10-19/01-profit-640.webp 640w, /assets/hero/2026-10-19/01-profit-960.webp 960w, /assets/hero/2026-10-19/01-profit.webp 1254w" imagesizes="(max-width: 1023px) calc(100vw - 48px), 46vw" fetchpriority="high" />\n  ';

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
  injectRoot(withChunkPreload(baseHtml, landingPreload + heroBannerPreload), buildLandingFallback()),
);

for (const route of routes) {
  const outputPath = join('dist', route.path, 'index.html');
  await mkdir(dirname(outputPath), { recursive: true });
  const chunk = route.kind === 'legal' ? legalPreload : seoPreload;
  const pageHtml = withChunkPreload(baseHtml, chunk + contentPreload(route) + heroPreload(route));
  await writeFile(outputPath, replaceMeta(pageHtml, route));
}

await writeFile(join('dist', 'robots-guard.js'), buildRobotsGuardScript());
await writeFile(join('dist', 'sitemap.xml'), buildSitemap());
// Манифест больше не нужен и не должен уехать на прод.
await rm(join('dist', '.vite'), { recursive: true, force: true });

console.log(`prerendered landing fallback, ${routes.length} route(s) and sitemap.xml`);
