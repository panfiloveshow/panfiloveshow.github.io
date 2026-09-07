import { readFile } from 'node:fs/promises';
import { routes } from './site-routes.mjs';

const queries = JSON.parse(await readFile('src/content/search-queries.json', 'utf8'));
const validLandings = new Set(['/', ...routes.map((route) => `/${route.path}/`)]);
const allowedIntents = new Set(['navigation', 'commercial', 'informational', 'transactional', 'tool']);
const allowedPriorities = new Set(['P0', 'P1', 'P2']);
const failures = [];
const seen = new Set();

if (!Array.isArray(queries) || queries.length < 20) failures.push('нужно минимум 20 контрольных запросов');

for (const [index, item] of queries.entries()) {
  const label = `строка ${index + 1}`;
  if (!item.cluster || !item.query || !item.intent || !item.landing || !item.priority) {
    failures.push(`${label}: заполнены не все поля`);
    continue;
  }
  const normalized = item.query.trim().toLocaleLowerCase('ru-RU');
  if (seen.has(normalized)) failures.push(`${label}: запрос дублируется — ${item.query}`);
  seen.add(normalized);
  if (!validLandings.has(item.landing)) failures.push(`${label}: landing не существует — ${item.landing}`);
  if (!allowedIntents.has(item.intent)) failures.push(`${label}: неизвестный intent — ${item.intent}`);
  if (!allowedPriorities.has(item.priority)) failures.push(`${label}: неизвестный priority — ${item.priority}`);
}

if (failures.length) {
  console.error(`Карта запросов: ${failures.length} проблем(ы)\n- ${failures.join('\n- ')}`);
  process.exitCode = 1;
} else {
  const clusters = new Set(queries.map((item) => item.cluster));
  console.log(`Карта запросов: ${queries.length} запросов, ${clusters.size} кластеров, все landing URL валидны`);
}
