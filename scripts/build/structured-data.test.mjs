import assert from 'node:assert/strict';
import {
  comparisonItemList,
  speakableSpecification,
  subscriptionOffers,
  synchronizeHomeStructuredData,
} from './structured-data.mjs';
import faqItems from '../../src/content/landing-faq.json' with { type: 'json' };

const offers = subscriptionOffers();
assert.deepEqual(offers.slice(0, 3).map(({ name, price }) => [name, price]), [
  ['Старт', 3000], ['Про', 8000], ['Бизнес', 15000],
]);
assert.ok(offers.every((offer) => offer['@type'] === 'Offer' && offer.priceCurrency === 'RUB'));
const enterprise = offers.find((offer) => offer.name === 'Enterprise');
assert.equal(enterprise.price, undefined);
assert.equal(enterprise.priceSpecification.price, undefined);
assert.equal(enterprise.priceSpecification.minPrice, 40000);
assert.ok(offers.every((offer) => offer.highPrice === undefined));
assert.ok(offers.every((offer) => offer.priceSpecification.billingDuration === 'P1M'));
assert.ok(offers.every((offer) =>
  Array.isArray(offer.priceSpecification['@type']) &&
  offer.priceSpecification['@type'].includes('PriceSpecification') &&
  offer.priceSpecification['@type'].includes('UnitPriceSpecification')),
  'PriceSpecification and UnitPriceSpecification preserve explicit monthly prices and bounds');

const old = { '@context': 'https://schema.org', '@graph': [
  { '@type': 'Organization', '@id': 'https://sellico.ru/#organization', address: { '@type': 'PostalAddress', addressLocality: 'Нижний Новгород', addressCountry: 'RU' } },
  { '@type': 'SoftwareApplication', '@id': 'https://sellico.ru/#software', url: 'https://sellico.ru', description: '</script><p>Example</p>', applicationCategory: 'BusinessApplication', operatingSystem: 'Web', featureList: ['Example'], inLanguage: 'ru-RU', offers: { '@type': 'AggregateOffer', highPrice: 40000 } },
  { '@type': 'FAQPage', '@id': 'https://sellico.ru/#faq', mainEntity: [] },
  { '@type': 'VideoObject', '@id': 'https://sellico.ru/#overview-video' },
] };
const source = `<html><script type="application/ld+json">${JSON.stringify(old).replaceAll('<', '\\u003c')}</script><body>Example</body></html>`;
const result = synchronizeHomeStructuredData(source);
assert.ok(result.includes('\\u003c/script>'));
const data = JSON.parse(result.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
const organization = data['@graph'].find((node) => node['@type'] === 'Organization');
assert.equal(organization.address.postalCode, '603096', 'Use the postal code published in the operator consent');
assert.equal(organization.address.streetAddress, 'ул. Светлоярская, 38, 73');
assert.equal(organization.address.addressRegion, 'Нижегородская область');
const service = data['@graph'].find((node) => node['@id'] === 'https://sellico.ru/#software');
assert.equal(service['@type'], 'Service', 'An unrated SaaS subscription must not claim the Google software-app result');
assert.equal(service.url, 'https://sellico.ru/');
assert.equal(service.provider['@id'], organization['@id']);
assert.equal(service.hasOfferCatalog['@type'], 'OfferCatalog');
assert.deepEqual(service.hasOfferCatalog.itemListElement, offers);
for (const field of ['applicationCategory', 'operatingSystem', 'featureList', 'inLanguage', 'publisher', 'offers', 'aggregateRating', 'review']) {
  assert.equal(service[field], undefined, `${field} must not leak from the old application markup`);
}
const faq = data['@graph'].find((node) => node['@type'] === 'FAQPage');
assert.deepEqual(faq.mainEntity.map((question) => ({ question: question.name, answer: question.acceptedAnswer.text })), faqItems);
const page = data['@graph'].find((node) => node['@type'] === 'WebPage');
assert.equal(page.mainEntity['@id'], service['@id']);
assert.ok(page.hasPart.some((part) => part['@id'] === faq['@id']));
assert.ok(typeof page.abstract === 'string' && page.abstract.trim().split(/\s+/).length >= 35, 'Homepage WebPage must expose abstract');
assert.deepEqual(page.speakable, { '@type': 'SpeakableSpecification', cssSelector: ['[data-direct-answer]'] });
assert.equal(synchronizeHomeStructuredData(result), result);
assert.throws(() => synchronizeHomeStructuredData('<html></html>'), /JSON-LD template/);

assert.deepEqual(
  speakableSpecification({ kind: 'feature', answer: { title: 'Ответ', text: 'Короткий ответ', points: ['1', '2', '3'] } }),
  { '@type': 'SpeakableSpecification', cssSelector: ['[data-direct-answer]'] },
);
assert.deepEqual(
  speakableSpecification({ kind: 'glossary', definition: 'Маржа — доля прибыли в выручке.' }),
  { '@type': 'SpeakableSpecification', cssSelector: ['[data-term-definition]'] },
);
assert.equal(speakableSpecification({ kind: 'legal' }), undefined);

const comparisons = comparisonItemList({
  kind: 'compare-hub',
  canonical: 'https://sellico.ru/compare/',
  h1: 'Сравнение Sellico с таблицами и сервисами аналитики',
  description: 'Как выбрать рабочий контур продавцу маркетплейсов.',
  sections: [
    { title: 'Sellico или Excel и Google Таблицы', href: '/compare/excel/' },
    { title: 'Sellico и внешние парсеры ниш', href: '/compare/external-analytics/' },
  ],
});
assert.equal(comparisons['@type'], 'ItemList');
assert.equal(comparisons['@id'], 'https://sellico.ru/compare/#comparisons');
assert.equal(comparisons.numberOfItems, 2);
assert.deepEqual(comparisons.itemListElement, [
  {
    '@type': 'ListItem',
    position: 1,
    name: 'Sellico или Excel и Google Таблицы',
    url: 'https://sellico.ru/compare/excel/',
  },
  {
    '@type': 'ListItem',
    position: 2,
    name: 'Sellico и внешние парсеры ниш',
    url: 'https://sellico.ru/compare/external-analytics/',
  },
]);

console.log('Structured data: SaaS service/catalog, real prices, open-ended Enterprise, operator address, shared FAQ, speakable, comparisons and safe serialization — OK');
