import assert from 'node:assert/strict';
import { submitEnterpriseLead } from './enterprise-lead.ts';

const lead = { name: ' Анна ', company: ' Компания ', email: ' anna@example.test ', contact: '', teamSize: '', stores: '', marketplaces: ['Ozon'], goal: ' Подключить магазины ' };
const id = '0d52ab07-204b-4a3f-bb2b-a62a20c2e44c';
let response = new Response(JSON.stringify({ saved: true, id: 42 }), { status: 201 });
globalThis.fetch = async (url, options) => {
  assert.equal(url, '/api/public/landing-applications');
  const payload = JSON.parse(String(options?.body));
  assert.equal(payload.request_id, id);
  assert.equal(payload.personal_data_consent, true);
  assert.equal(payload.name, 'Анна');
  assert.equal(payload.email, 'anna@example.test');
  return response;
};
assert.equal(await submitEnterpriseLead(lead, id), 42);
response = new Response(JSON.stringify({ saved: true, id: 42 }), { status: 200 });
assert.equal(await submitEnterpriseLead(lead, id), 42, 'An acknowledged retry also succeeds');
for (const body of [{ saved: false, id: 42 }, { saved: true, id: '42' }, { saved: true, id: -1 }]) {
  response = new Response(JSON.stringify(body), { status: 200 });
  await assert.rejects(() => submitEnterpriseLead(lead, id), /подтвердить сохранение/);
}
response = new Response('<html>not an API</html>', { status: 200 });
await assert.rejects(() => submitEnterpriseLead(lead, id), /подтвердить сохранение/);
response = new Response('{}', { status: 429 });
await assert.rejects(() => submitEnterpriseLead(lead, id), /через минуту/);
response = new Response('{}', { status: 422 });
await assert.rejects(() => submitEnterpriseLead(lead, id), /Проверьте/);
console.log('enterprise-lead: ok');
