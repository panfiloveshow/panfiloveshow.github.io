import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';

const indexPath = join('dist', 'index.html');
const indexHtml = await readFile(indexPath, 'utf8');

const organization = {
  '@type': 'Organization',
  '@id': 'https://sellico.ru/#organization',
  name: 'Sellico',
  legalName: 'ИП ЗУБАРЕВ ДАНИЛ ВИКТОРОВИЧ',
  url: 'https://sellico.ru/',
  logo: 'https://sellico.ru/logo.svg',
  email: 'hello@sellico.ru',
  description:
    'Российская операционная система для продавцов и команд, управляющих магазинами на Wildberries, Ozon и Яндекс Маркете.',
  identifier: {
    '@type': 'PropertyValue',
    propertyID: 'ИНН',
    value: '644154992160',
  },
  areaServed: {
    '@type': 'Country',
    name: 'Россия',
  },
  sameAs: ['https://t.me/sellico'],
};

const routes = [
  {
    path: 'features',
    kind: 'features',
    title: 'Возможности Sellico — финансы, поставки, SEO и команда',
    description:
      'Возможности Sellico для продавцов маркетплейсов: финансы и юнит-экономика, остатки, поставки, реклама, SEO, отзывы, заявки и задачи команды.',
    canonical: 'https://sellico.ru/features/',
    eyebrow: 'Возможности',
    h1: 'Вся операционная работа продавца — в одном пространстве',
    lead:
      'Sellico объединяет данные маркетплейсов и ежедневные процессы команды: от финансовой сводки и запасов до SEO, отзывов и задач.',
    sections: [
      {
        title: 'Финансы и юнит-экономика',
        text: 'Сводите выручку, комиссии, логистику, себестоимость и другие расходы, чтобы оценивать результат по магазину и SKU.',
        items: ['Финансовая сводка', 'Показатели по товарам', 'ABC-анализ и маржинальность'],
      },
      {
        title: 'Остатки и поставки',
        text: 'Контролируйте доступный запас и планируйте поставки на основе данных подключённых кабинетов.',
        items: ['Единый список остатков', 'Планирование поставок', 'Сигналы по дефициту'],
      },
      {
        title: 'Реклама и цены',
        text: 'Сопоставляйте рекламные показатели с экономикой товара и управляйте рабочими действиями в одном контуре.',
        items: ['Кампании и ставки', 'Связь с экономикой SKU', 'Контроль изменений'],
      },
      {
        title: 'SEO карточек',
        text: 'Проверяйте качество карточек, находите зоны улучшения и готовьте описания с помощью AI-инструментов.',
        items: ['SEO-аудит', 'Проверка карточек', 'AI-генерация описаний'],
      },
      {
        title: 'Отзывы и заявки',
        text: 'Собирайте обращения и отзывы в рабочих очередях, чтобы команда быстрее распределяла и обрабатывала их.',
        items: ['Отзывы маркетплейсов', 'Входящие заявки', 'Очереди и статусы'],
      },
      {
        title: 'Команда и задачи',
        text: 'Организуйте работу команды через задачи, канбан, календарь, чат и роли внутри единого пространства.',
        items: ['Канбан и календарь', 'Ответственные и сроки', 'Чаты и организатор'],
      },
    ],
  },
  {
    path: 'pricing',
    kind: 'pricing',
    title: 'Тарифы Sellico — цены и лимиты для продавцов маркетплейсов',
    description:
      'Тарифы Sellico от 3 000 ₽ в месяц. Сравните лимиты магазинов, пользователей, товаров, SEO, отзывов и автопланирования поставок.',
    canonical: 'https://sellico.ru/pricing/',
    eyebrow: 'Тарифы',
    h1: 'Прозрачные тарифы для магазина, команды и агентства',
    lead:
      '3 дня бесплатного доступа без привязки банковской карты. Все цены указаны за месяц, а лимиты видны до подключения.',
    sections: [
      {
        title: 'Старт — 3 000 ₽ в месяц',
        text: 'Для одного магазина: 1 API-интеграция, 3 пользователя и до 50 товаров.',
        items: ['Юнит-экономика', 'Задачи и координация', '20 SEO-генераций', '1 автоплан поставки'],
      },
      {
        title: 'Про — 8 000 ₽ в месяц',
        text: 'Для растущей команды: 3 API-интеграции, 10 пользователей и до 150 товаров.',
        items: ['Всё из тарифа «Старт»', 'Финансовая отчётность', '100 SEO-генераций', '4 автоплана поставок'],
      },
      {
        title: 'Бизнес — 15 000 ₽ в месяц',
        text: 'Для бренда или агентства: 6 API-интеграций, 20 пользователей и до 300 товаров.',
        items: ['Всё из тарифа «Про»', 'Заявки и лиды', 'Sellico Meet', '8 автопланов поставок'],
      },
      {
        title: 'Enterprise — от 40 000 ₽ в месяц',
        text: 'Для сложного контура данных: договорные лимиты и индивидуальный сценарий внедрения.',
        items: ['Договорные интеграции', 'Настройка ролей', 'Индивидуальные лимиты', 'Сопровождение внедрения'],
      },
    ],
  },
  {
    path: 'marketplaces',
    kind: 'marketplaces',
    title: 'Sellico для Wildberries, Ozon и Яндекс Маркета',
    description:
      'Единое рабочее пространство Sellico для магазинов на Wildberries, Ozon и Яндекс Маркете: финансы, остатки, реклама, SEO и команда.',
    canonical: 'https://sellico.ru/marketplaces/',
    eyebrow: 'Маркетплейсы',
    h1: 'Wildberries, Ozon и Яндекс Маркет — в одном кабинете',
    lead:
      'Подключайте магазины разных площадок и работайте с их данными в общей финансовой, товарной и командной модели Sellico.',
    sections: [
      {
        title: 'Wildberries',
        text: 'Контролируйте экономику, остатки, карточки и отзывы Wildberries вместе с задачами ответственных.',
        items: ['Финансовые показатели', 'Остатки и поставки', 'SEO карточек и отзывы'],
      },
      {
        title: 'Ozon',
        text: 'Собирайте данные Ozon в едином кабинете и сопоставляйте продажи, расходы, запас и качество карточек.',
        items: ['Юнит-экономика', 'Планирование запаса', 'Реклама и SEO'],
      },
      {
        title: 'Яндекс Маркет',
        text: 'Добавляйте магазин Яндекс Маркета в общий операционный контур вместе с другими площадками.',
        items: ['Общая финансовая сводка', 'Остатки и товары', 'Командные процессы'],
      },
    ],
  },
  {
    path: 'privacy',
    kind: 'legal',
    title: 'Политика обработки персональных данных — Sellico',
    description:
      'Политика Sellico: какие персональные данные и cookies обрабатываются, цели, правовые основания, сроки хранения и права пользователя.',
    canonical: 'https://sellico.ru/privacy/',
    eyebrow: 'Юридическая информация',
    h1: 'Политика обработки персональных данных',
    lead:
      'Документ описывает, какие данные обрабатывает Sellico, зачем они нужны, как хранятся и как пользователь может отозвать согласие.',
    sections: [
      {
        title: '1. Оператор персональных данных',
        text: 'Оператор: ИП ЗУБАРЕВ ДАНИЛ ВИКТОРОВИЧ, ИНН 644154992160. Email для обращений: hello@sellico.ru.',
      },
      {
        title: '2. Какие данные обрабатываются',
        text: 'Email, сведения из обращений, IP-адрес, тип устройства и браузера, источник перехода, страницы просмотра, дата и время визита, cookie-идентификаторы.',
      },
      {
        title: '3. Цели и основания обработки',
        text: 'Регистрация и доступ к сервису, обработка заявок, поддержка, исполнение договора, улучшение сайта и исполнение требований законодательства. Основания: согласие, договор и требования закона.',
      },
      {
        title: '4. Cookies и аналитика',
        text: 'Необходимые cookies используются для работы интерфейса. Аналитические cookies применяются после согласия пользователя. Отказ доступен в cookie-баннере и настройках браузера.',
      },
      {
        title: '5. Срок хранения и права пользователя',
        text: 'Данные хранятся до достижения целей, отзыва согласия или окончания обязательного срока. Пользователь может запросить сведения, уточнение, блокирование или удаление данных по адресу hello@sellico.ru.',
      },
      {
        title: '6. Защита данных',
        text: 'Оператор принимает правовые, организационные и технические меры защиты от неправомерного доступа, изменения, блокирования, копирования и распространения.',
      },
    ],
  },
  {
    path: 'personal-data-consent',
    kind: 'legal',
    title: 'Согласие на обработку персональных данных — Sellico',
    description:
      'Согласие пользователя Sellico на обработку персональных данных: перечень данных, цели обработки, срок действия и порядок отзыва.',
    canonical: 'https://sellico.ru/personal-data-consent/',
    eyebrow: 'Юридическая информация',
    h1: 'Согласие на обработку персональных данных',
    lead:
      'Согласие применяется при отправке формы регистрации или заявки на сайте Sellico.',
    sections: [
      {
        title: '1. Субъект и оператор',
        text: 'Пользователь сайта sellico.ru добровольно даёт согласие оператору ИП ЗУБАРЕВ ДАНИЛ ВИКТОРОВИЧ, ИНН 644154992160.',
      },
      {
        title: '2. Перечень данных',
        text: 'Email, IP-адрес, cookie-идентификаторы, сведения о браузере, устройстве, источнике перехода, дате и времени визита, а также сведения из дальнейшего общения.',
      },
      {
        title: '3. Цели обработки',
        text: 'Создание аккаунта, обработка заявки, предоставление доступа, коммуникация по регистрации и поддержке, анализ работы сайта и улучшение пользовательского опыта.',
      },
      {
        title: '4. Разрешённые действия',
        text: 'Сбор, запись, систематизация, накопление, хранение, уточнение, использование, передача по поручению, обезличивание, блокирование, удаление и уничтожение данных.',
      },
      {
        title: '5. Срок и отзыв',
        text: 'Согласие действует до достижения целей или отзыва. Отозвать его можно письмом на hello@sellico.ru. Согласие не разрешает распространение данных неопределённому кругу лиц.',
      },
    ],
  },
];

const faqItems = [
  [
    'Что такое Sellico?',
    'Sellico — российская операционная система для продавцов и команд, управляющих магазинами на Wildberries, Ozon и Яндекс Маркете.',
  ],
  [
    'С какими маркетплейсами работает Sellico?',
    'Sellico поддерживает Wildberries, Ozon и Яндекс Маркет. Доступность данных определяется API площадки и выбранным тарифом.',
  ],
  [
    'Сколько времени занимает подключение магазина?',
    'Первый магазин можно подключить примерно за 15 минут. Для старта не требуется переносить рабочие таблицы или привязывать банковскую карту.',
  ],
  [
    'Есть ли бесплатный период?',
    'Да. Для тарифов Sellico предусмотрено 3 дня бесплатного доступа без привязки банковской карты.',
  ],
  [
    'Сколько стоит Sellico?',
    'Тариф «Старт» стоит 3 000 ₽ в месяц, «Про» — 8 000 ₽, «Бизнес» — 15 000 ₽. Enterprise начинается от 40 000 ₽ в месяц.',
  ],
];

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
  return `
    <footer style="margin-top:64px;border-top:1px solid #dfe7e2;padding-top:26px;color:#53635b;font-size:13px;line-height:1.6">
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

        <section id="faq" aria-labelledby="fallback-faq-title" style="padding:64px 0">
          <h2 id="fallback-faq-title" style="margin:0;font-size:clamp(34px,5vw,58px);letter-spacing:-.045em">Вопросы о Sellico</h2>
          <div style="display:grid;gap:12px;margin-top:28px">
            ${faqItems
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
          <nav aria-label="Хлебные крошки" style="font-size:13px;color:rgba(255,255,255,.75)"><a href="/" style="color:white">Главная</a> / ${escapeHtml(route.eyebrow)}</nav>
          <p style="margin:34px 0 0;color:#b8efd8;font-size:12px;font-weight:700;letter-spacing:.16em;text-transform:uppercase">${escapeHtml(route.eyebrow)}</p>
          <h1 style="max-width:920px;margin:18px 0 0;font-size:clamp(38px,6vw,70px);line-height:1;letter-spacing:-.052em">${escapeHtml(route.h1)}</h1>
          <p style="max-width:790px;margin:24px 0 0;color:rgba(255,255,255,.8);font-size:18px;line-height:1.7">${escapeHtml(route.lead)}</p>
        </section>
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
                </article>`,
            )
            .join('')}
        </section>
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
  return {
    '@type': 'BreadcrumbList',
    '@id': `${route.canonical}#breadcrumb`,
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Главная',
        item: 'https://sellico.ru/',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: route.eyebrow,
        item: route.canonical,
      },
    ],
  };
}

function routeSchema(route) {
  const graph = [
    organization,
    {
      '@type': 'WebPage',
      '@id': `${route.canonical}#webpage`,
      url: route.canonical,
      name: route.title,
      description: route.description,
      inLanguage: 'ru-RU',
      dateModified: '2026-07-24',
      publisher: {
        '@id': 'https://sellico.ru/#organization',
      },
      breadcrumb: {
        '@id': `${route.canonical}#breadcrumb`,
      },
    },
    breadcrumbSchema(route),
  ];

  if (route.kind === 'pricing') {
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

  return {
    '@context': 'https://schema.org',
    '@graph': graph,
  };
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

  const schema = JSON.stringify(routeSchema(route)).replaceAll('<', '\\u003c');
  next = next.replace(
    /<script type="application\/ld\+json">[\s\S]*?<\/script>/,
    `<script type="application/ld+json">${schema}</script>`,
  );

  return injectRoot(next, buildRouteFallback(route));
}

await writeFile(indexPath, injectRoot(indexHtml, buildLandingFallback()));

for (const route of routes) {
  const outputPath = join('dist', route.path, 'index.html');
  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, replaceMeta(indexHtml, route));
}

console.log(`prerendered landing fallback and ${routes.length} route(s)`);
