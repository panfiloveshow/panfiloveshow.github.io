// Единый источник правды по публичным страницам сайта.
// Используется пререндером (HTML-фолбэк, meta, schema.org), генератором sitemap.xml
// и списком индексируемых путей в index.html.
// Контент детальных страниц (маркетплейсы и функции) лежит в src/content/detail-pages.json —
// один источник для React-страниц и статического фолбэка.
import { readPages } from './build-content-index.mjs';
import hubFaq from '../src/content/hub-faq.json' with { type: 'json' };
import hubContent from '../src/content/hub-content.json' with { type: 'json' };
import { editorialAuthor, editorialMethodologyUrl, getEditorialSources } from './editorial-data.mjs';

const detailPages = await readPages();

const detailRoutes = Object.entries(detailPages).map(([slug, page]) => ({
  path: slug,
  kind: page.kind,
  lastmod: page.lastmod,
  created: page.created,
  priority: '0.9',
  changefreq: 'monthly',
  title: page.title,
  description: page.description,
  canonical: `https://sellico.ru/${slug}/`,
  eyebrow: page.eyebrow,
  parent: page.parent,
  h1: page.h1,
  lead: page.lead,
  answer: page.answer,
  definition: page.definition,
  formula: page.formula,
  sections: page.blocks,
  faq: page.faq,
  related: page.related,
  editorial: {
    author: editorialAuthor,
    methodologyUrl: editorialMethodologyUrl,
    sources: getEditorialSources(slug),
  },
}));

export const organization = {
  '@type': 'Organization',
  '@id': 'https://sellico.ru/#organization',
  name: 'Sellico',
  legalName: 'ИП ЗУБАРЕВ ДАНИЛ ВИКТОРОВИЧ',
  alternateName: 'Sellico — операционная система для продавцов маркетплейсов',
  url: 'https://sellico.ru/',
  disambiguatingDescription:
    'Sellico на домене sellico.ru — российский SaaS для управления магазинами на Wildberries, Ozon и Яндекс Маркете.',
  logo: 'https://sellico.ru/logo.svg',
  email: 'hello@sellico.ru',
  description:
    'Российская операционная система для продавцов и команд, управляющих магазинами на Wildberries, Ozon и Яндекс Маркете.',
  identifier: [
    {
      '@type': 'PropertyValue',
      propertyID: 'ИНН',
      value: '644154992160',
    },
    {
      '@type': 'PropertyValue',
      propertyID: 'Свидетельство Роспатента на программу для ЭВМ',
      value: '2026686895',
    },
  ],
  areaServed: {
    '@type': 'Country',
    name: 'Россия',
  },
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Нижний Новгород',
    addressCountry: 'RU',
  },
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'customer support',
    email: 'hello@sellico.ru',
    url: 'https://sellico.ru/contacts/',
    availableLanguage: ['ru'],
  },
  sameAs: ['https://t.me/sellico'],
  knowsAbout: [
    'аналитика маркетплейсов',
    'юнит-экономика маркетплейсов',
    'управление остатками',
    'планирование поставок',
    'SEO карточек товаров',
  ],
};

export const website = {
  '@type': 'WebSite',
  '@id': 'https://sellico.ru/#website',
  url: 'https://sellico.ru/',
  name: 'Sellico',
  alternateName: 'Sellico для продавцов маркетплейсов',
  inLanguage: 'ru-RU',
  publisher: {
    '@id': 'https://sellico.ru/#organization',
  },
};

export const editorialPerson = {
  '@type': 'Person',
  '@id': editorialAuthor.id,
  name: editorialAuthor.name,
  givenName: 'Данил',
  familyName: 'Зубарев',
  url: editorialAuthor.url,
  description: editorialAuthor.description,
  jobTitle: editorialAuthor.jobTitle,
  email: editorialAuthor.email,
  affiliation: {
    '@id': 'https://sellico.ru/#organization',
  },
  worksFor: {
    '@id': 'https://sellico.ru/#organization',
  },
  knowsAbout: [
    'аналитика маркетплейсов',
    'юнит-экономика маркетплейсов',
    'управление остатками',
    'планирование поставок',
    'SEO карточек товаров',
  ],
};

export const landingFaq = [
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
  [
    'Кто разработчик Sellico и кому принадлежат права на программу?',
    'Разработчик и правообладатель — ИП Зубарев Данил Викторович. Программа для ЭВМ «Sellico» зарегистрирована в Роспатенте: свидетельство № 2026686895, дата регистрации в Реестре программ для ЭВМ — 2 сентября 2026 года.',
  ],
];

const baseRoutes = [
  {
    path: 'features',
    kind: 'features',
    lastmod: '2026-08-25',
    priority: '0.8',
    changefreq: 'monthly',
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
    faq: hubFaq['features'],
    extra: hubContent['features'],
  },
  {
    path: 'pricing',
    kind: 'pricing',
    lastmod: '2026-09-22',
    priority: '0.8',
    changefreq: 'monthly',
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
    faq: hubFaq['pricing'],
    table: hubContent['pricing'].table,
    extra: hubContent['pricing'],
  },
  {
    path: 'marketplaces',
    kind: 'marketplaces',
    lastmod: '2026-08-25',
    priority: '0.8',
    changefreq: 'monthly',
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
        href: '/wildberries/',
      },
      {
        title: 'Ozon',
        text: 'Собирайте данные Ozon в едином кабинете и сопоставляйте продажи, расходы, запас и качество карточек.',
        items: ['Юнит-экономика', 'Планирование запаса', 'Реклама и SEO'],
        href: '/ozon/',
      },
      {
        title: 'Яндекс Маркет',
        text: 'Добавляйте магазин Яндекс Маркета в общий операционный контур вместе с другими площадками.',
        items: ['Общая финансовая сводка', 'Остатки и товары', 'Командные процессы'],
        href: '/yandex-market/',
      },
    ],
    faq: hubFaq['marketplaces'],
    table: hubContent['marketplaces'].table,
    extra: hubContent['marketplaces'],
  },
  ...detailRoutes,
  {
    path: 'privacy',
    kind: 'legal',
    lastmod: '2026-09-22',
    priority: '0.2',
    changefreq: 'yearly',
    title: 'Политика обработки персональных данных — Sellico',
    description:
      'Политика Sellico: какие персональные данные и cookies обрабатываются, цели, правовые основания, сроки хранения и права пользователя.',
    canonical: 'https://sellico.ru/privacy/',
    eyebrow: 'Юридическая информация',
    h1: 'Политика обработки персональных данных',
    lead:
      'Документ описывает обработку данных на сайте и в сервисе Sellico, роли оператора и обработчика, цели, хранение, защиту и права субъектов.',
    sections: [
      {
        title: '1. Оператор персональных данных',
        text: 'Оператор сайта, аккаунтов, договоров и прямых заявок: ИП ЗУБАРЕВ ДАНИЛ ВИКТОРОВИЧ, ИНН 644154992160, правообладатель программы для ЭВМ «Sellico» (свидетельство Роспатента № 2026686895 от 02.09.2026). При обработке данных, загруженных клиентом о третьих лицах, Sellico действует по поручению клиента.',
      },
      {
        title: '2. Какие данные обрабатываются',
        text: 'Контакты и профиль пользователя, сведения из заявок и поддержки, данные рабочих пространств и подключённых интеграций, договорные сведения, журналы безопасности, технические данные и cookie.',
      },
      {
        title: '3. Цели и основания обработки',
        text: 'Регистрация и доступ, функции рабочих пространств и интеграций, заявки и поддержка, договоры и расчёты, безопасность и исполнение закона. Основания зависят от цели: согласие, договор, закон или законный интерес.',
      },
      {
        title: '4. Клиентские данные и специальные категории',
        text: 'Клиент отвечает за законность данных третьих лиц в своём рабочем пространстве. В модуле больничных сведения о здоровье могут обрабатываться только по поручению клиента-работодателя при наличии основания по статье 10 Федерального закона № 152-ФЗ.',
      },
      {
        title: '5. Внешние сервисы, cookies, сроки и права',
        text: 'Для отдельных функций могут использоваться Яндекс, Mistral AI, Telegram, MAX, ЮKassa и API маркетплей. Аналитика включается только после согласия. Запросить доступ, уточнение, блокирование, удаление или отозвать согласие можно через hello@sellico.ru.',
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
    lastmod: '2026-09-22',
    priority: '0.2',
    changefreq: 'monthly',
    title: 'Согласие на обработку персональных данных — Sellico',
    description:
      'Согласие пользователя Sellico на обработку персональных данных: перечень данных, цели обработки, срок действия и порядок отзыва.',
    canonical: 'https://sellico.ru/personal-data-consent/',
    eyebrow: 'Юридическая информация',
    h1: 'Согласие на обработку персональных данных',
    lead: 'Согласие применяется при регистрации, отправке прямой заявки или обращения в Sellico; версия документа и техническое доказательство принятия сохраняются.',
    sections: [
      {
        title: '1. Субъект и оператор',
        text: 'Пользователь сайта sellico.ru добровольно даёт согласие оператору ИП ЗУБАРЕВ ДАНИЛ ВИКТОРОВИЧ, ИНН 644154992160.',
      },
      {
        title: '2. Перечень данных',
        text: 'Имя, email, телефон или другой способ связи, сведения о компании и задаче, IP-адрес, user-agent, дата, источник формы, версия документа и сведения из дальнейшего общения.',
      },
      {
        title: '3. Цели обработки',
        text: 'Создание аккаунта, обработка заявки, предоставление доступа, коммуникация, поддержка и подтверждение факта выраженного согласия.',
      },
      {
        title: '4. Разрешённые действия',
        text: 'Сбор, запись, систематизация, накопление, хранение, уточнение, использование, передача по поручению, обезличивание, блокирование, удаление и уничтожение данных.',
      },
      {
        title: '5. Срок и отзыв',
        text: 'Согласие действует до достижения целей или отзыва по hello@sellico.ru. Отзыв не отменяет законную обработку до его получения. Согласие не разрешает распространение данных неопределённому кругу лиц.',
      },
    ],
  },
];

export const routes = baseRoutes.map((route) =>
  route.editorial || route.kind === 'legal'
    ? route
    : {
        ...route,
        editorial: {
          author: editorialAuthor,
          methodologyUrl: editorialMethodologyUrl,
          sources: getEditorialSources(route.path),
        },
      },
);

// Пути, которым разрешена индексация (index.html снимает индексацию со всего остального).
export const publicPaths = ['/', ...routes.map((route) => `/${route.path}`)];
