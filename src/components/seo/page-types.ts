import pagesIndex from '@/content/pages-index.json';

export type DetailPageType = keyof typeof pagesIndex;
export type SeoPageType = 'features' | 'pricing' | 'marketplaces' | DetailPageType;

type PageTheme = {
  /** background страницы-героя целиком */
  hero: string;
  /** цвет надзаголовка и хлебных крошек на тёмном фоне */
  eyebrow: string;
  /** подложка плитки с логотипом */
  tile: string;
  /** акцент списков и ссылок */
  mark: string;
  /** светлая заливка секций */
  soft: string;
  /** фон нижнего блока с призывом */
  cta: string;
};

export type DetailPage = {
  kind: string;
  lastmod: string;
  created?: string;
  cover?: { src: string; alt: string; credit: string; creditUrl: string };
  certificate?: {
    number: string;
    date: string;
    application: string;
    applicationDate: string;
    program: string;
    holder: string;
    note: string;
    url: string;
  };
  facts?: string[][];
  eyebrow: string;
  parent?: string[];
  logo?: string;
  icon?: string;
  theme?: PageTheme;
  title: string;
  description: string;
  h1: string;
  lead: string;
  answer?: { title: string; text: string; points: string[] };
  definition?: string;
  formula?: { rows: { label: string; expression: string }[]; note: string };
  actions?: { label: string; value: string; href: string; note: string }[];
  requisites?: { title: string; rows: string[][]; note: string };
  calc?: string;
  demo?: { view: string; caption: string };
  table?: { title: string; lead: string; columns: string[]; rows: string[][]; highlight?: number };
  blocksTitle: string;
  blocksLead: string;
  blocks: { title: string; text: string; items: string[]; href?: string; image?: string }[];
  faq: string[][];
  related: string[][];
};

// Фирменная зелёная тема. Страницы маркетплейсов переопределяют её своими цветами.
export const BRAND_THEME: PageTheme = {
  hero: 'radial-gradient(circle at 82% 8%, rgba(100,213,184,.3), transparent 32%), linear-gradient(145deg,#145a41 0%,#0b3c2c 70%,#082c20 100%)',
  eyebrow: '#A7F3D0',
  tile: '#E6F8F3',
  mark: '#11543F',
  soft: '#F4F8F6',
  cta: '#0B6B4D',
};

const pageLoaders = import.meta.glob<{ default: DetailPage }>('../../content/pages/**/*.json');
const pageCache = new Map<string, Promise<DetailPage>>();

export function loadPage(slug: string): Promise<DetailPage> {
  let promise = pageCache.get(slug);
  if (!promise) {
    const loader = pageLoaders[`../../content/pages/${slug}.json`];
    promise = loader().then((module) => module.default);
    pageCache.set(slug, promise);
  }
  return promise;
}

export function formatEditorialDate(value: string): string {
  return new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  })
    .format(new Date(`${value}T00:00:00Z`))
    // Дата не должна рваться на «2» и «сентября» в конце строки
    .replace(/ /g, '\u00a0');
}

export function pluralRu(count: number, [one, few, many]: [string, string, string]): string {
  return ({ one, few } as Record<string, string>)[new Intl.PluralRules('ru-RU').select(count)] ?? many;
}
