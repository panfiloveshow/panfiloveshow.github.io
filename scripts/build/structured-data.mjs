import landingFaq from '../../src/content/landing-faq.json' with { type: 'json' };
import homeAnswer from '../../src/content/home-answer.json' with { type: 'json' };
import pricingCatalog from '../../src/content/pricing.json' with { type: 'json' };

const origin = 'https://sellico.ru';
export const homeDirectAnswer = homeAnswer;
const pricingUrl = `${origin}/pricing/`;

// Published operator details: https://sellico.ru/personal-data-consent/
export const organizationAddress = {
  '@type': 'PostalAddress',
  streetAddress: 'ул. Светлоярская, 38, 73',
  addressLocality: 'Нижний Новгород',
  addressRegion: 'Нижегородская область',
  postalCode: '603096',
  addressCountry: 'RU',
};

// A quote starting at 40,000 RUB is a lower bound, not a fixed price or a maximum.
export function subscriptionOffers() {
  return pricingCatalog.plans.map((plan) => {
    const minimum = Boolean(plan.priceFrom);
    const amount = plan.monthlyPriceRub;
    return {
      '@type': 'Offer',
      name: plan.name,
      url: pricingUrl,
      priceCurrency: pricingCatalog.currency,
      ...(minimum
        ? { description: `От ${amount.toLocaleString('ru-RU')} ₽ в месяц. Итоговая стоимость определяется индивидуальными условиями.` }
        : { price: amount }),
      priceSpecification: {
        // UnitPriceSpecification retains the monthly billing period;
        // the explicit parent type is also valid Schema.org.
        '@type': ['PriceSpecification', 'UnitPriceSpecification'],
        priceCurrency: pricingCatalog.currency,
        ...(minimum ? { minPrice: amount } : { price: amount }),
        unitText: 'месяц',
        billingDuration: 'P1M',
      },
    };
  });
}

// A hosted subscription is a Service. Its catalog can describe a quote's lower
// bound without claiming a software-app rich result that needs a real review.
export function subscriptionService({
  id = `${origin}/#software`,
  name = 'Sellico',
  url = `${origin}/`,
  description = 'Онлайн-сервис для управления магазинами на Wildberries, Ozon и Яндекс Маркете.',
  image,
} = {}) {
  return {
    '@type': 'Service',
    // Retain the published entity IDs so existing graph references stay valid.
    '@id': id,
    name,
    url,
    description,
    ...(image ? { image } : {}),
    serviceType: 'SaaS для управления магазинами на маркетплейсах',
    provider: { '@id': `${origin}/#organization` },
    areaServed: { '@type': 'Country', name: 'Россия' },
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      '@id': `${pricingUrl}#plans`,
      name: 'Тарифы Sellico',
      url: pricingUrl,
      itemListElement: subscriptionOffers(),
    },
  };
}

// Voice assistants and answer engines extract concise self-contained blocks.
export function speakableSpecification(route) {
  if (route?.answer) {
    return {
      '@type': 'SpeakableSpecification',
      cssSelector: ['[data-direct-answer]'],
    };
  }
  if (route?.kind === 'glossary' && route?.definition) {
    return {
      '@type': 'SpeakableSpecification',
      cssSelector: ['[data-term-definition]'],
    };
  }
  return undefined;
}

export function comparisonItemList(route) {
  const items = (route?.sections ?? []).filter((section) => section.href);
  return {
    '@type': 'ItemList',
    '@id': `${route.canonical}#comparisons`,
    name: route.h1,
    description: route.description,
    numberOfItems: items.length,
    itemListElement: items.map((section, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: section.title,
      url: new URL(section.href, origin).href,
    })),
  };
}

// The Vite hook runs for both dev HTML and production builds. Prerender uses
// the resulting home graph as its template, replacing it for interior pages.
export function synchronizeHomeStructuredData(html) {
  const pattern = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/;
  const match = html.match(pattern);
  if (!match) throw new Error('Homepage JSON-LD template is missing');
  const data = JSON.parse(match[1]);
  const graph = data['@graph'];
  const organization = graph.find((node) => node['@id'] === `${origin}/#organization`);
  const subscriptionIndex = graph.findIndex((node) => node['@id'] === `${origin}/#software`);
  const faq = graph.find((node) => node['@id'] === `${origin}/#faq`);
  if (!organization || subscriptionIndex < 0 || !faq) throw new Error('Homepage organization, subscription or FAQ entity is missing');
  organization.address = { ...organizationAddress };
  const previous = graph[subscriptionIndex];
  const service = subscriptionService({
    name: previous.name,
    description: previous.description,
    image: previous.image,
  });
  graph[subscriptionIndex] = service;
  faq.mainEntity = landingFaq.map(({ question, answer }) => ({
    '@type': 'Question', name: question,
    acceptedAnswer: { '@type': 'Answer', text: answer },
  }));
  for (const node of graph) {
    if (node.url === origin) node.url = `${origin}/`;
  }
  const pageId = `${origin}/#webpage`;
  let page = graph.find((node) => node['@id'] === pageId);
  if (!page) {
    page = { '@type': 'WebPage', '@id': pageId };
    graph.push(page);
  }
  Object.assign(page, {
    url: `${origin}/`,
    name: 'Sellico — операционная система для продавцов маркетплейсов',
    description: 'Sellico: финансы, юнит-экономика, остатки, поставки, реклама, SEO, отзывы и задачи команды для WB, Ozon и Яндекс Маркета.',
    abstract: homeAnswer.text,
    speakable: { '@type': 'SpeakableSpecification', cssSelector: ['[data-direct-answer]'] },
    inLanguage: 'ru-RU',
    isPartOf: { '@id': `${origin}/#website` },
    mainEntity: { '@id': service['@id'] },
    hasPart: [{ '@id': faq['@id'] }, { '@id': `${origin}/#overview-video` }],
  });
  return html.replace(pattern, () => `<script type="application/ld+json">${JSON.stringify(data).replaceAll('<', '\\u003c')}</script>`);
}
